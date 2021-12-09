const fs = require('fs')
const axios = require('axios')
const io = require('socket.io-client')
const ptp = require("pdf-to-printer")
const PDFDocument = require('pdfkit')
const probe = require('probe-image-size')
const sharp = require('sharp')

const download_image = (url, image_path) =>
    axios({
        url,
        responseType: 'stream',
    }).then(
        response =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            }),
    );

function printGrayscale(options, amount){
    if(options.printColor && parseFloat(amount) >= parseFloat(options.minColor)){
        return false
    }
    return true
}

function startListening(options) {
    let streamlabs = io(`https://sockets.streamlabs.com?token=${options.socketToken}`, { transports: ['websocket'] });

    streamlabs.on('event', (eventData) => {
        if (!eventData.for && eventData.type === 'donation') {
            //code to handle donation events
            let messageObj = eventData.message[0]
            let id = messageObj._id
            let message = messageObj.message
            let rawAmount = messageObj.amount
            let formattedAmount = messageObj.formattedAmount
            let from = messageObj.from
            let currency = messageObj.currency

            let currencyCheck = checkCurrency(options.selectedCurrency, currency, options.enforceCurrency)

            printDonation(options, id, message, rawAmount, formattedAmount, from, currencyCheck)
        }

        if (options.enableSuperChats && eventData.for === 'youtube_account' && eventData.type === 'superchat'){
            let messageObj = eventData.message[0]
            let id = messageObj._id
            let message = messageObj.comment
            let rawAmount = messageObj.amount / 1000000
            let formattedAmount = messageObj.displayString
            let from = messageObj.name
            let currency = messageObj.currency

            let currencyCheck = checkCurrency(options.selectedCurrency, currency, options.enforceCurrency)

            printDonation(options, id, message, rawAmount, formattedAmount, from, currencyCheck)
        }
    })

    return streamlabs
}

function tryImgurMatch(message) {
    // fetching the direct link from an indirect link is as simple as
    // adding an image file extension to it.
    // fetching the direct link from an album link is more complicated
    // so I haven't done it yet.
    const imgurRegex = /https?:\/\/(www\.)?imgur\.com\/[a-zA-Z0-9]+/gi;
    let imgurLink = message.match(imgurRegex);
    if (imgurLink === null) {
        return null
    }
    else {
        // imgur will provide the direct image from adding this,
        // regardless of if the original was a jpg or png.
        image = imgurLink[0] + ".jpg"
        return image
    }
}

function printDonation(options, id, message, rawAmount, formattedAmount, from, currencyCheck) {
    if (currencyCheck && parseFloat(rawAmount) >= parseFloat(options.minDonation)) {
        const imageRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)(?:jpe?g|png)/gi

        let images = message.match(imageRegex)
        let image

        if (Array.isArray(images)) {
            image = images[0]
        } else {
            image = tryImgurMatch(message)
        }

        let text = message.replace(imageRegex, '').trim()

        let doc = new PDFDocument({ layout: 'landscape' })
        let writeStream = fs.createWriteStream(`./pdfs/${id}.pdf`)
        doc.pipe(writeStream)

        doc.fontSize(24)
        doc.text(formattedAmount)
        if (image) {
            // save image
            // if b/w printing, process image
            // probe image size
            // put image in pdf
            let image_file_name = id
            if (image.match(/\.(jpe?g)$/i) != null) {
                image_file_name += ".jpg"
            } else {
                image_file_name += ".png"
            }
            let image_path = './images/' + image_file_name
            let grayscalepath = "./images/bw" + image_file_name

            download_image(image, image_path).then(value => {
                if(printGrayscale(options, rawAmount)){
                    return sharp(image_path).grayscale().toFile(grayscalepath)
                }
                return Promise.resolve()
            }).then(result => {
                probe(image).then(result => {
                    let widthPoints = result.width * .75
                    let heightPoints = result.height * .75
                    let imageOptions = false
                    let x = false
                    let y = false
                    if (widthPoints > 640 || heightPoints > 300) {
                        imageOptions = { fit: [640, 300], align: 'center', valign: 'center' }
                    } else {
                        x = (792 - widthPoints) / 2
                        y = (612 - heightPoints) / 2 - 20
                    }

                    let final_image_path = image_path

                    if (printGrayscale(options, rawAmount)){
                        final_image_path = grayscalepath
                    }

                    if (imageOptions) {
                        doc.image(final_image_path, 76, 136, imageOptions)
                    } else {
                        doc.image(final_image_path, x, y)
                    }
                    return Promise.resolve()
                }).then(value => {
                    doc.fontSize(24)
                    doc.text('- ' + from, 72, 510, { align: 'right' })
                    if (text.length > 0) {
                        doc.fontSize(19)
                        doc.text('"' + text + '"', 72, 460, { align: 'center' })
                    }

                    doc.end()

                    writeStream.on('close', () => {
                        ptp.print(`./pdfs/${id}.pdf`, {
                            printer: options.printer
                        })
                    })

                    return Promise.resolve()
                })
            })
        } else {
            doc.moveDown(3)
            if (text.length > 0) {
                let fontSize = 34
                if (text.length <= 64) {
                    fontSize = 54
                } else if (text.length <= 128) {
                    fontSize = 44
                }
                doc.fontSize(fontSize)
                doc.text('"' + text + '"', { align: 'center', width: 648 })
            }
            doc.fontSize(24)
            doc.text('- ' + from, 72, 510, { align: 'right' })
            doc.end()

            ptp.print(`./pdfs/${id}.pdf`, {
                printer: options.printer
            })
        }
    }
}

function checkCurrency(currency, donationCurrency, enforceCurrency){
    if(enforceCurrency && currency === donationCurrency) return true
    else if(!enforceCurrency) return true
    else return false
}

async function getPrinters() {
    return ptp.getPrinters()
}

export default {
    startListening,
    getPrinters
}
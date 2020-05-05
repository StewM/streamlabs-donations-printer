const fs = require('fs')
const request = require('request')
const io = require('socket.io-client')
const ptp = require("pdf-to-printer")
const PDFDocument = require('pdfkit')
const probe = require('probe-image-size')

function startListening(options) {
    let streamlabs = io(`https://sockets.streamlabs.com?token=${options.socketToken}`, { transports: ['websocket'] });

    streamlabs.on('event', (eventData) => {
        if (!eventData.for && eventData.type === 'donation') {
            //code to handle donation events
            let message = eventData.message[0]
            let id = message._id

            if (message.amount >= options.minDonation) {
                const imageRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)(?:jpg|png)/g

                let images = message.message.match(imageRegex)
                let image

                if (Array.isArray(images)) {
                    image = images[0]
                } else {
                    image = images
                }

                let text = message.message.replace(imageRegex, '')

                let promises = []
                let doc = new PDFDocument({ layout: 'landscape' })
                doc.pipe(fs.createWriteStream(`./pdfs/${id}.pdf`))

                doc.fontSize(18)
                doc.text(message.formattedAmount)
                if (image) {
                    promises.push(new Promise((resolve, reject) => {
                        probe(image).then(result => {
                            console.log(result)
                            let widthPoints = result.width * .75
                            let heightPoints = result.height * .75
                            let imageOptions = false
                            let x = false
                            let y = false
                            if(widthPoints > 640 || heightPoints > 300){
                                imageOptions = { fit: [640, 300], align: 'center', valign: 'center' }
                            } else {
                                x = (792 - widthPoints) /2
                                y = (612 - heightPoints) /2 - 20
                            }
                            request({
                                url: image,
                                encoding: null
                            }, function (err, response, body) {
                                if(imageOptions){
                                    doc.image(body, 76, 136, imageOptions)
                                } else {
                                    doc.image(body, x, y)
                                }
                            }).on('close', resolve)
                        })
                    }))
                }

                Promise.all(promises).then((values) => {
                    if (image) {
                        doc.moveDown()
                        doc.fontSize(14)
                        doc.text('"' + text + '"', 72, 460, { align: 'center' })
                        doc.fontSize(13)
                        doc.text('- ' + message.from, 72, 520, { align: 'right' })
                    } else {
                        doc.moveDown(6)
                        doc.fontSize(23)
                        doc.text('"' + text + '"', { align: 'center', width: 648 })
                        doc.fontSize(13)
                        doc.text('- ' + message.from, 72, 520, { align: 'right' })
                    }
                    doc.end()

                    ptp.print(`./pdfs/${id}.pdf`, {
                        printer: options.printer
                    })
                })
            }
        }
    })

    return streamlabs
}

export default {
    startListening
}
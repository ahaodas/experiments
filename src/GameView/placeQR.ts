import QRCode from 'qrcode'
export const placeQR = (roomId: string) => {
    const link = location.href + '?roomId=' + roomId
    console.log(link)
    QRCode.toDataURL(link)
        .then(url => {
            const img = document.createElement('img')
            img.src = url
            img.id = 'img'
            img.style.margin = 'auto'
            img.style.width = '300px'
            img.style.display = 'block'
            document.body.prepend(img)
        })
        .catch(err => {
            console.error(err)
        })
}
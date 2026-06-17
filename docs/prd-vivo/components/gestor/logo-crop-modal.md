# logo-crop-modal

## LogoCropModal

RECEBE: imageUrl (string), onConfirm (blob: Blob) => void, onClose () => void

ESTADO:
  crop = { x: 0, y: 0 }
  zoom = 1
  croppedArea = Area | null

onCropComplete (_ pixelCrop: Area, croppedPixels: Area)
  setCroppedArea(croppedPixels)

handleConfirm ()
  SE !croppedArea → sair
  blob = await cropAndCompress(imageUrl, croppedArea)
  onConfirm(blob)

RENDERIZA
  overlay fixed inset-0 z-[90] com fundo black/60
    onClick fora do modal → onClose()
  painel 420px max, rounded-[22px], fundo surface, shadow-lg
    cabecalho: titulo "Ajustar logo" + botao X → onClose
    area de crop 300x300 com fundo preto:
      Cropper (react-easy-crop):
        image=imageUrl, crop, zoom, aspect=1, cropShape='round', showGrid=false
        onCropChange=setCrop, onZoomChange=setZoom, onCropComplete=onCropComplete
    controle de zoom: label "Zoom" + input range min=1 max=3 step=0.1 → setZoom
    botoes: Cancelar → onClose | Confirmar (brand, Check icon) → handleConfirm

---

## cropAndCompress (imageSrc, crop: Area) → Promise<Blob>

RECEBE: imageSrc (string), crop (Area com x, y, width, height em pixels)
cria canvas 512x512
ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, 512, 512)
canvas.toBlob com type='image/webp', quality=0.82
RETORNA blob

---

## loadImage (src) → Promise<HTMLImageElement>

RECEBE: src (string)
cria HTMLImageElement, aguarda onload
RETORNA elemento de imagem

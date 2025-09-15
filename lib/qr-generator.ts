import QRCode from "qrcode"

export async function generateQRCode(participantId: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(participantId, {
      width: 300,
      margin: 2,
      color: {
        dark: "#164e63", // Primary color
        light: "#ffffff",
      },
      errorCorrectionLevel: "medium", // Medium error correction for better scanning
    })
    return qrCodeDataURL
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export function downloadQRCode(dataURL: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataURL
  link.download = `${filename}-qr-code.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

declare module "qrcode" {
  interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: "low" | "medium" | "quartile" | "high";
    type?: string;
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  interface QRCodeToStringOptions extends QRCodeToDataURLOptions {
    scale?: number;
  }

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;

  export function toString(
    text: string,
    options?: QRCodeToStringOptions
  ): Promise<string>;

  const QRCode: {
    toDataURL: typeof toDataURL;
    toString: typeof toString;
  };

  export default QRCode;
}

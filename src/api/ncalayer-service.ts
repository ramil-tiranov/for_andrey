import { NCALayerClient } from '../api/ncalayer-client';

export const signData = async (data: string, actionType: string): Promise<string | null> => {
  const ncalayerClient = new NCALayerClient();

  try {
    console.log("Data to sign:", data);

    await ncalayerClient.connect();

    // Преобразуем данные в base64
    const base64Data = btoa(data);
    console.log("Base64 encoded data:", base64Data);

    const signedData = await ncalayerClient.createCAdESFromBase64(
      'PKCS12',
      base64Data,
      'SIGNATURE',
      true
    );

    console.log("Signed data (cms):", signedData);

    if (typeof signedData === 'string') {
      return signedData;
    } else {
      console.error("Unexpected signed data format:", signedData);
      return null;
    }
  } catch (error) {
    console.error("Error signing data:", error);
    throw new Error(`Signing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

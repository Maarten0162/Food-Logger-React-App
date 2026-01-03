import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import React, { useEffect, useState } from "react";
import * as Haptics from "expo-haptics";
import axios from "axios";



interface FSProduct {
    brands: string;
    ingredients_text: string;
    nutriments: Nutriments;
}

interface OFFProduct {
    brands: string;
    ingredients_text: string;
    nutriments: Nutriments;
}

interface Nutriments {
    carbohydrates_100g?: number;
    proteins_100g?: number;
    fat_100g?: number;
}

interface ProductData {
    code: string;
    product: FSProduct | OFFProduct;
    source: "FoodSecrect" | "OFF"
}



async function searchBarcode(barcode: string, accessToken: string) {
//   const resp = await axios.get(
//     `https://platform.fatsecret.com/rest/food/barcode/find-by-id/v2?barcode=${barcode}&format=json`,
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     }
//   );
//   if (resp.data.error && resp.data.error.code === 211){
    return fetchProduct(barcode)
//   }
//   return resp
    
}

async function getAccessToken(clientId: string, clientSecret: string) {
    const token = btoa(`${clientId}:${clientSecret}`);

    const resp = await axios.post(
        "https://oauth.fatsecret.com/connect/token",
        "grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${token}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    return resp.data.access_token;
}

const fetchProduct = async (barcode: string): Promise<ProductData | null> => {
    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
        );
        const data: ProductData = await response.json();

        // Make sure nutriments exists
        if (!data.product.nutriments) {
            data.product.nutriments = {};
        }

        // Access variables safely
        const productCode = data.code;
        const brand = data.product.brands;
        const carbs = data.product.nutriments?.carbohydrates_100g;
        const fat = data.product.nutriments?.fat_100g;
        const protein = data.product.nutriments?.proteins_100g;

        console.log(productCode, brand, carbs, fat, protein );

        return data; // ✅ return the product data
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
};



export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [data, setData] = useState("");
    const [product, setProduct] = useState<any | null>(null);

    // auto-request on mount
    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <Text>Checking camera permission...</Text>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={{ marginBottom: 10 }}>
                    Camera permission is required to scan.
                </Text>
                <TouchableOpacity onPress={requestPermission}>
                    <Text style={{ color: "blue" }}>Tap to grant permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleScan = async (result: BarcodeScanningResult) => {
        if (scanned) return;
        setScanned(true);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Vibration.vibrate([200, 100, 200]);

        setData(result.data);

        try {
            const token = await getAccessToken(
                "d0763303a0514f0a8a13ad63a4c4a494",
                "97e8094a37b1411b96f20e05b5e2f863"
            );

            const productData = await searchBarcode(result.data, token);
            setProduct(productData);
        } catch (err) {
            console.error("Error fetching product:", err);
            setProduct(null);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <CameraView
                style={StyleSheet.absoluteFill}
                onBarcodeScanned={handleScan}
                barcodeScannerSettings={{
                    barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e"],
                }}
            />

            {scanned && (
                <View style={styles.resultBox}>
                    <Text>Scanned: {data}</Text>

                    {product === null ? (
                        <Text>Loading product...</Text> // <-- show while fetching
                    ) : product ? (
                        <Text>Product: {JSON.stringify(product, null, 2)}</Text>
                    ) : (
                        <Text>Product not found</Text> // <-- only if fetch returned null
                    )}

                    <TouchableOpacity onPress={() => {
                        setScanned(false);
                        setProduct(null); // reset for next scan
                    }}>
                        <Text style={{ color: "blue" }}>Scan again</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    resultBox: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
    },
});

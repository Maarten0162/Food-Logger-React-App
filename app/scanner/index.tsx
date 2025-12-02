import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import React, { useEffect, useState } from "react";
import * as Haptics from "expo-haptics";
import axios from "axios";

interface Product {
  brands: string;
  categories: string;
  ingredients_text: string;
  ingredients_n: number;
  carbohydrates: number;
}

interface ProductData {
  code: string;
  product: Product;
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

    const fetchProduct = async (barcode: string) => {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data: ProductData = await response.json(); // TypeScript now knows the structure

        // Access variables
        const productCode = data.code;
        const brand = data.product.brands;
        const categories = data.product.categories;
        const ingredientsText = data.product.ingredients_text;
        const numIngredients = data.product.ingredients_n;
        const carbs = data.product.carbohydrates;

        console.log(productCode, carbs, brand, categories, ingredientsText, numIngredients);
    } catch (error) {
        console.error("Error fetching product:", error);
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

      const productData = await fetchProduct(result.data);
      console.log("Product data:", productData);
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
          {product ? (
            <Text>Product: {JSON.stringify(product, null, 2)}</Text>
          ) : (
            <Text>Product not found</Text>
          )}
          <TouchableOpacity onPress={() => setScanned(false)}>
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

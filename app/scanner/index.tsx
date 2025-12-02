import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState("");

  // auto-request on mount
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();  // 🔥 this triggers it automatically
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

  const handleScan = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setData(result.data);
    console.log("Scanned:", result.type, result.data);
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

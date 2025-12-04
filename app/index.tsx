import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const [food, setFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://food-logger-backend-one.vercel.app/api/food"
        );
        setFood(response.data);
      } catch (err: any) {
        console.error("Error fetching food:", err.message);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    //getfood();
    //fetchData();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        gap: 20,
      }}
    >
      {/* ⬇️ Navigation button */}
      <Button title="Go to scanner" onPress={() => router.push("/scanner")} />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center" }}>
          ⚠️ Error: {error}
        </Text>
      ) : (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Food data:</Text>
          {food.length === 0 ? (
            <Text>No food items found.</Text>
          ) : (
            food.map((item) => (
              <Text key={item.id}>
                🍎 {item.foodname} - {item.calories} kcal
              </Text>
            ))
          )}
        </>
      )}

      <Image
        source={require("../assets/images/icon.png")}
        style={{ width: 200, height: 200, marginTop: 20 }}
      />
    </View>
  );
}

async function getfood() {
  const response = await fetch(
    "https://food-logger-backend-one.vercel.app/api/food"
  );
  const data = await response.json();
  console.log(data);
}

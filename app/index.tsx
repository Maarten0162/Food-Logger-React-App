import React from "react";
import { Text, View, Image  } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
       <Image
        source={require("../assets/images/icon.png")} // local image
         style={{ width: 200, height: 200, marginTop: 20 }}
      />
    </View>
  );
}

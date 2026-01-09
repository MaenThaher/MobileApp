import { ScrollView, StyleSheet, View } from "react-native";



export default function Contact(){

return(<ScrollView contentContainerStyle={styles.container}>
<View style={styles.card}>
<View>



</View>
 
</View>

</ScrollView>)

}


const styles = StyleSheet.create({
container: {
    padding: 20,
    backgroundColor: "red",
    flexGrow: 1,
    justifyContent: "center",
  },
  card:{
    backgroundColor:"black",borderRadius:16,
    padding:24,
  },


})
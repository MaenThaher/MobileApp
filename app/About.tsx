import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function About(){

return(<ScrollView style={styles.container}>

<View style={styles.header}>
<Text style={styles.headerText}>CircuitAi</Text>
</View>



<View style={styles.footer}>
<Text style={styles.footerText}>© CircuitAI 2026</Text>
</View>

</ScrollView>);


}


const styles = StyleSheet.create
({
  container:{flex:1,backgroundColor:"blue"},
  header:{padding:20,backgroundColor:"red",alignItems:"center"},
  headerText:{fontSize:24,fontWeight:"bold",color:"green"},
  footer:{padding:20,alignItems:"center",backgroundColor:"yellow"},
  footerText:{fontSize:14,color:"orange"}
});



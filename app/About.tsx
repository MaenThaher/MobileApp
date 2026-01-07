import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function About(){

return(<ScrollView style={styles.container}>

<View style={styles.header}>
<Text style={styles.headerText}>CircuitAi</Text>
</View>

<View styles={styles.contentWrapper}>

<View style={styles.section}>
<Text style={styles.pageTitle}>About CircuitAI</Text>


<Text style={styles.contentText}> 
  CircuitAI is a graduation project built by final-year students in the Electrical 
  and Computer Engineering department at An-Najah National University. 
  </Text>


<Text style={styles.contentText}> This project represents months of research,
   development, and collaboration between students 
   who experienced firsthand the challenges of learning circuit theory 
   and applying it in practice. 
   </Text>


</View>





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
  footerText:{fontSize:14,color:"orange"},
  contentWrapper:{padding: 20},
  section:{marginBottom: 30},
  pageTitle:{fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "rgba(59, 165, 59, 1)"},
  contentText: { fontSize: 16, lineHeight: 22, marginBottom: 10, color: "#95c0f5ff" },

});



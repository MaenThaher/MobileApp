import { ScrollView, StyleSheet, Text, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";

export default function About(){

return(<ScrollView style={styles.container}>

<View style={styles.header}>
<Text style={styles.headerText}>CircuitAi</Text>
</View>

<View style={styles.contentWrapper}>

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


<Text style={styles.contentText}> By students, for students — CircuitAI is designed
   to bridge the gap between 
   classroom theory and hands-on lab work. 
   </Text>

</View>


<View style={styles.section}>
<Text style={styles.sectionHeading}>The Team</Text>

<View style={styles.teamLayout}>

<View style={styles.teamMemberCard}>

<Feather name="code" size={40} color="#333"/>
<Text style={styles.roleTitle}>Backend & AI</Text>
<Text style={styles.roleDescription}>Building the AI tutor and integrating it with course materials. 
  Developing the simulation engine and knowledge base.
  </Text>
</View>

<View style={styles.teamMemberCard}> 
  <Feather name="zap" size={40} color="#333" />
   <Text style={styles.roleTitle}>Frontend & UX Engineer</Text>
    <Text style={styles.roleDescription}> Creating the interactive 
      workspace and user interface. 
      Ensuring the platform is intuitive and accessible. 
  </Text> </View>

</View>


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
  sectionHeading:{fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#858b9eff"},
  teamLayout:{flexDirection:"row",justifyContent:"space-between",marginBottom:10},
  teamMemberCard:{flex:1,margin:5,padding:10,borderWidth:1,borderColor:"#553352ff",borderRadius:8,alignItems:"center",backgroundColor:"#fd1"},
  roleTitle:{fontSize:18,fontWeight:"600",marginTop:5,color:"#f32"},
  roleDescription:{fontSize:14,textAlign:"center",marginTop:5,color:"#94A3B8"},


});



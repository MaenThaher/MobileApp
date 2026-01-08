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
  </Text> 
  </View>
</View>

<View style={styles.teamNote}> 
  <Text style={styles.noteText}> We are students building CircuitAI 
  as our capstone graduation project under faculty supervision. 
  </Text> 
</View>


</View>


<View style={styles.section}>
<Text style={styles.sectionHeading}>
  From lab frustrations to a better tool
</Text>

 <Text style={styles.contentText}> During our studies, 
  we encountered several
   persistent challenges: 
 </Text>

 <View style={styles.bulletList}>
  <Text style={styles.bulletItem}>
  • Limited lab time with crowded equipment schedules
 </Text>

<Text style={styles.bulletItem}> • Generic AI tools giving 
  incorrect circuit advice or unsafe suggestions 
  </Text> 

<Text style={styles.bulletItem}> • Difficulty connecting abstract 
  formulas from slides to physical circuits 
  </Text> 

<Text style={styles.bulletItem}> • Lack of practice 
  opportunities before high-stakes lab exams 
  </Text>

<View/>

<Text style={styles.contentText}> 
  These frustrations led us to create 
  CircuitAI — a platform that addresses each of these pain points: 
</Text>

<View style={styles.bulletList}>

<Text style={styles.bulletItem}>
 • A domain-specific AI tutor trained on electrical engineering concepts 
</Text>

<Text style={styles.bulletItem}>
   • An interactive simulator 
  with instant visual feedback 
</Text>

<Text style={styles.bulletItem}> 
  • A platform aligned with
   An-Najahs actual curriculum and lab assignments 
   </Text>

<Text style={styles.bulletItem}> 
  • Unlimited practice time
   accessible from anywhere 
   </Text>
</View>

</View>

</View>

<View style={styles.section}>
<Text style={styles.sectionHeading}>
  Graduation project & research
</Text>
<View style={styles.infoCard}>

  <Text style={styles.contentText}> This project is part 
    of the Graduation Project 
    I/II course sequence, 
    representing the culmination of our undergraduate studies. 
    </Text>

   <Text style={[styles.contentText, { fontWeight: "500", color: "#333" }]}> 
    Project goals: 
    </Text>

<View style={styles.bulletList}>
  
  <Text style={styles.bulletItem}>
   • Evaluate if a domain-specific 
  AI tutor improves circuit understanding 
  </Text>

  <Text style={styles.bulletItem}> 
  • Provide a safe practice 
  environment outside physical labs
   </Text>

   <Text style={styles.bulletItem}> 
    • Demonstrate the feasibility 
    of course-integrated learning tools 
    </Text>

   <Text style={styles.bulletItem}>
     • Create a foundation 
    for future student improvements 
    </Text> 

 </View>
    
    <Text style={styles.contentText}> CircuitAI is currently a prototype 
      and pilot implementation. It is not yet a commercial product. 
      Performance and features are scoped to meet the requirements 
      of our graduation project and initial research objectives. 
      </Text>
 
 </View>


</View>

{/* How It's Built */} 
<View style={styles.section}>

<Text style={styles.sectionHeading}>Under the hood</Text>
<View style={styles.techLayout}>
<View style={styles.techItem}>

<Text style={styles.techTitle}>Web Application</Text>
 
  <Text style={styles.roleDescription}> Modern React-based 
  interface for building 
  and simulating circuits 
  with real-time visual feedback. 
  </Text>

</View>

<View style={styles.techItem}>

<Text style={styles.techTitle}>Backend Services</Text> 

<Text style={styles.roleDescription}> Scalable API for circuit 
  simulation and AI-powered tutoring responses. 
</Text>

</View>

<View style={styles.techItem}>
<Text style={styles.techTitle}>Knowledge Base</Text>
 <Text style={styles.roleDescription}> 
  Built from course materials, textbooks,
   and verified circuit examples from An-Najah curriculum. 
   </Text>
</View>

<View style={styles.techItem}>
<Text style={styles.techTitle}>Simulation Engine</Text> 
<Text style={styles.roleDescription}> 

  Custom circuit solver with support for

   DC, AC, and transient analysis. 
   </Text>
</View>




</View>


</View>

{/* what Next */}
<View style={styles.section}>

<Text style={styles.sectionHeading}>Future plans</Text>



<View style={styles.infoCard}>
<View style={styles.bulletList}>
<Text style={styles.bulletItem}> → Extend support to more 
  courses across different years and specializations 
  </Text>

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
  teamNote:{padding:10,borderWidth:1,borderColor:"#334155",borderRadius:8,backgroundColor:"#1E293B"},
  noteText:{fontSize:14,color:"#94A3B8"},
  bulletList:{marginVertical:10},
  bulletItem:{fontSize:16,lineHeight:22,marginVertical:2,color:"#CBD5E1"},
  infoCard:{padding:10,borderWidth:1,borderColor:"#334155",borderRadius:8,marginBottom:10,backgroundColor:"#1E293B"},
  techLayout:{flexDirection:"row",flexWrap:"wrap"},
  techItem:{flexBasis:"48%",marginVertical:5,padding:10,borderWidth:1,borderColor:"#334155",borderRadius:8,backgroundColor:"#1E293B"},
  techTitle:{fontSize:16,fontWeight:"600",marginBottom:5,color:"#E0E7FF"}

});



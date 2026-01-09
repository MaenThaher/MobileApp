import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";


export default function Contact(){
const [submitted,setSubmitted]=useState(false);
const [role,setRole]=useState<string | null>(null);



return(<ScrollView contentContainerStyle={styles.container}>
<View style={styles.card}>
<View style={styles.formColumn}>

<Text style={styles.pageTitle}>
    Contact us
</Text>


 <Text style={styles.introText}>
            Questions, feedback, or interested in using CircuitAI in your course?
            Send us a message.
 </Text>
 
 { submitted ? 
 (
 <View style={styles.successMessage}>

<Text style={styles.successText}>
Thanks! we well get back to you soon.
</Text>

 </View>
 ):(
<>

<View style={styles.formField}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  placeholder="Your full name"
                  style={styles.input}
                />
              </View>
</>
 )
 

 }



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
  formColumn:{
  padding:30,
  },
  pageTitle:{
    fontSize:32,
    fontWeight:"800",color:"#e9e9e9ff",
    marginBottom:12,
  },
  card:{
    backgroundColor:"black",borderRadius:16,
    padding:24,
  },
  introText:{fontSize:16,
    color:"#aaa",
    marginBottom:24,
  },
  formField:{marginBottom:18},
  label:{color:"#ddd",marginBottom:6,fontWeight:500},
  input:{backgroundColor:"#000",borderColor:"#333",borderWidth:1,borderRadius:10,padding:12,color:"#fff"},
  successMessage:{padding:20,backgroundColor:"rgba(79,70,229,0.15)"},
  successText:{color:"#4f46e5",fontWeight:"600",textAlign:"center"},


})
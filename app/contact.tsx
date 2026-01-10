import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";


export default function Contact(){
const [submitted,setSubmitted]=useState(false);
const [role,setRole]=useState<string | null>(null);

const handleSubmit = ()=>{
  setSubmitted(true);
  setTimeout(()=>setSubmitted(false),5000)
};

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



<View style={styles.formField}>

                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="your.email@najah.edu"
                  keyboardType="email-address"
                  style={styles.input}
/>

 </View>

 
  <View style={styles.formField}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleContainer}>
                  {["Student", "Professor", "Admin", "Other"].map((r) => (
              <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      style={[
                        styles.roleButton,
                        role === r && styles.roleButtonActive,
                      ]}
                  >
                      <Text
                        style={[
                          styles.roleText,
                          role === r && styles.roleTextActive,
                        ]}
                      >
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

            <View style={styles.formField}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  placeholder="Tell us what you're thinking..."
                  multiline
                  numberOfLines={6}
                  style={[styles.input, styles.textarea]}
                />
              </View>

              <Pressable style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Send message</Text>
              </Pressable>

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
    backgroundColor: "#0f0f0f",
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
  roleContainer:{flexDirection:"row",flexWrap:"wrap",gap:10},
  roleButton:{borderWidth:1,borderColor:"#333",paddingVertical:8,paddingHorizontal:14,borderRadius:20,},
  roleText:{color:"#aaa"},
  roleTextActive:{color:"#fff",fontWeight:"600"},
  roleButotnActive:{backgroundColor:"#4f46e5",borderColor:"#4f46e5"},
  roleButtonActive:{backgroundColor:"#4f46e5",borderColor:"#4f46e5"},
  textarea:{height:120,textAlignVertical:"top"},
  button:{marginTop:12,backgroundColor:"#4f46e5",paddingVertical:14,borderRadius:12,alignItems:"center",},
  buttonText:{color:"#fff",fontWeight:"600",fontSize:16},
  


})
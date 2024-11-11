// ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  TextInput,
  Modal,
  useColorScheme,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const defaultAvatar = "https://via.placeholder.com/150";

const ProfileScreen = ({ navigation }) => {
  const systemColorScheme = useColorScheme();
  const [isEditing, setIsEditing] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState("");
  const [userData, setUserData] = useState({
    fullName: "Joseph Njeri",
    email: "joseph@example.com",
    phone: "+254 123 456 789",
    idNumber: "ID12345678",
    profileImage: null,
  });

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    biometricLogin: true,
    darkMode: false,
  });

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          Alert.alert(
            "Biometric Record Not Found",
            "Please set up biometric authentication in your device settings."
          );
          return;
        }

        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType("Face ID");
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ) {
          setBiometricType("Fingerprint");
        } else {
          setBiometricType("Biometric");
        }
      }
    } catch (error) {
      console.log("Error checking biometric support:", error);
      setIsBiometricSupported(false);
    }
  };

  const handleBiometricToggle = async (newValue) => {
    if (!isBiometricSupported) {
      Alert.alert(
        "Not Supported",
        "Biometric authentication is not supported on this device."
      );
      return;
    }

    if (newValue) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to enable biometric login",
          disableDeviceFallback: true,
          cancelLabel: "Cancel",
        });

        if (result.success) {
          setSettings((prev) => ({ ...prev, biometricLogin: true }));
          Alert.alert(
            "Success",
            `${biometricType} login enabled successfully!`
          );
        } else {
          // Authentication was cancelled or failed
          setSettings((prev) => ({ ...prev, biometricLogin: false }));
          Alert.alert(
            "Authentication Failed",
            "Please try again to enable biometric login."
          );
        }
      } catch (error) {
        console.log("Authentication Error:", error);
        setSettings((prev) => ({ ...prev, biometricLogin: false }));
        Alert.alert(
          "Error",
          "There was an error with biometric authentication."
        );
      }
    } else {
      // User is trying to disable biometric login
      setSettings((prev) => ({ ...prev, biometricLogin: false }));
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: settings.darkMode ? "#1a1a1a" : "#fff",
      },
      headerTintColor: settings.darkMode ? "#fff" : "#000",
    });
  }, [settings.darkMode]);

  const theme = settings.darkMode ? darkTheme : lightTheme;

  const handleEditPress = () => {
    if (isEditing) {
      Alert.alert("Success", "Profile updated successfully");
    }
    setIsEditing(!isEditing);
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setUserData((prev) => ({
          ...prev,
          profileImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
    setImageModalVisible(false);
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your camera"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setUserData((prev) => ({
          ...prev,
          profileImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
    setImageModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () =>
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          }),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]
    );
  };

  const ImagePickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={imageModalVisible}
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.textColor }]}>
            Change Profile Photo
          </Text>
          <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color={theme.textColor} />
            <Text style={[styles.modalOptionText, { color: theme.textColor }]}>
              Take Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
            <Ionicons name="images" size={24} color={theme.textColor} />
            <Text style={[styles.modalOptionText, { color: theme.textColor }]}>
              Choose from Gallery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderProfileSection = () => (
    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        style={styles.profileHeader}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={
              userData.profileImage
                ? { uri: userData.profileImage }
                : { uri: defaultAvatar }
            }
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={() => setImageModalVisible(true)}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.profileDetails}>
        {Object.entries(userData).map(([key, value]) => {
          if (key === "profileImage") return null;
          return (
            <View key={key} style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.textColor }]}>
                {key.charAt(0).toUpperCase() +
                  key.slice(1).replace(/([A-Z])/g, " $1")}
                :
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textColor,
                      borderColor: theme.borderColor,
                      backgroundColor: theme.inputBackground,
                    },
                  ]}
                  value={value}
                  onChangeText={(text) =>
                    setUserData((prev) => ({ ...prev, [key]: text }))
                  }
                  placeholderTextColor={theme.placeholderColor}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: theme.textColor }]}>
                  {value}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
        Settings
      </Text>
      {Object.entries(settings).map(([key, value]) => {
        // Skip showing biometric option if not supported
        if (key === "biometricLogin" && !isBiometricSupported) {
          return null;
        }

        return (
          <View
            key={key}
            style={[
              styles.settingItem,
              { borderBottomColor: theme.borderColor },
            ]}
          >
            <View>
              <Text style={[styles.settingLabel, { color: theme.textColor }]}>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .charAt(0)
                  .toUpperCase() + key.replace(/([A-Z])/g, " $1").slice(1)}
              </Text>
              {key === "biometricLogin" && (
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textColor },
                  ]}
                >
                  {`Enable ${biometricType} login for quick access`}
                </Text>
              )}
            </View>
            <Switch
              value={value}
              onValueChange={(newValue) => {
                if (key === "biometricLogin") {
                  handleBiometricToggle(newValue);
                } else {
                  setSettings((prev) => ({ ...prev, [key]: newValue }));
                }
              }}
              trackColor={{
                false: theme.switchTrackColor,
                true: theme.accentColor,
              }}
              thumbColor={
                value
                  ? theme.switchThumbColorActive
                  : theme.switchThumbColorInactive
              }
            />
          </View>
        );
      })}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <ImagePickerModal />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          Profile
        </Text>
        <TouchableOpacity onPress={handleEditPress}>
          <Ionicons
            name={isEditing ? "checkmark-outline" : "create-outline"}
            size={24}
            color={theme.accentColor}
          />
        </TouchableOpacity>
      </View>

      {renderProfileSection()}
      {renderSettingsSection()}

      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.accentColor}
          />
          <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={[styles.buttonText, styles.deleteText]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const lightTheme = {
  backgroundColor: "#f5f5f5",
  cardBackground: "#ffffff",
  textColor: "#333333",
  accentColor: "#4c669f",
  borderColor: "#e0e0e0",
  inputBackground: "#ffffff",
  placeholderColor: "#999999",
  switchTrackColor: "#d0d0d0",
  switchThumbColorActive: "#ffffff",
  switchThumbColorInactive: "#f4f3f4",
  gradientStart: "#4c669f",
  gradientEnd: "#3b5998",
};

const darkTheme = {
  backgroundColor: "#121212",
  cardBackground: "#1e1e1e",
  textColor: "#ffffff",
  accentColor: "#6b8cce",
  borderColor: "#2c2c2c",
  inputBackground: "#2c2c2c",
  placeholderColor: "#666666",
  switchTrackColor: "#4c4c4c",
  switchThumbColorActive: "#ffffff",
  switchThumbColorInactive: "#b0b0b0",
  gradientStart: "#2c3e50",
  gradientEnd: "#3498db",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    margin: 10,
    borderRadius: 15,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileHeader: {
    padding: 20,
    alignItems: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 5,
    right: -10,
    backgroundColor: "#4c669f",
    borderRadius: 20,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  profileDetails: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 5,
    opacity: 0.7,
  },
  fieldValue: {
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    padding: 20,
    paddingBottom: 0,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  settingLabel: {
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: "#f0f0f0",
  },
  logoutText: {
    color: "#4c669f",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },
  deleteText: {
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  modalCancelButton: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#ff3b30",
    fontWeight: "bold",
  },
});

export default ProfileScreen;

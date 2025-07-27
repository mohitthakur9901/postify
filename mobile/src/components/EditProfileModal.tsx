import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TextInput,
} from "react-native";
import * as Location from 'expo-location';
import { useState } from "react";
import { Feather } from "@expo/vector-icons";

interface EditProfileModalProps {
    isVisible: boolean;
    onClose: () => void;
    formData: {
        firstName: string;
        lastName: string;
        bio: string;
        location: string;
    };
    saveProfile: () => void;
    updateFormField: (field: string, value: string) => void;
    isUpdating: boolean;
}

const EditProfileModal = ({
    formData,
    isUpdating,
    isVisible,
    onClose,
    saveProfile,
    updateFormField,
}: EditProfileModalProps) => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    const handleSave = () => {
        saveProfile();
        onClose();
    };
    const addLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            // Reverse geocode to get address
            const [place] = await Location.reverseGeocodeAsync(location.coords);

            if (place) {
                const city = place.city || place.subregion || '';
                const country = place.country || '';
                const fullLocation = [city, country].filter(Boolean).join(', ');

                updateFormField('location', fullLocation);
            }
        } else {
            alert("Permission to access location was denied.");
        }
    };


    return (
        <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={onClose}>
                    <Text className="text-blue-500 text-lg">Cancel</Text>
                </TouchableOpacity>

                <Text className="text-lg font-semibold">Edit Profile</Text>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isUpdating}
                    className={`${isUpdating ? "opacity-50" : ""}`}
                >
                    {isUpdating ? (
                        <ActivityIndicator size="small" color="#1DA1F2" />
                    ) : (
                        <Text className="text-blue-500 text-lg font-semibold">Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-500 text-sm mb-2">First Name</Text>
                        <TextInput
                            className="border border-gray-200 rounded-lg p-3 text-base"
                            value={formData.firstName}
                            onChangeText={(text) => updateFormField("firstName", text)}
                            placeholder="Your first name"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 text-sm mb-2">Last Name</Text>
                        <TextInput
                            className="border border-gray-200 rounded-lg px-3 py-3 text-base"
                            value={formData.lastName}
                            onChangeText={(text) => updateFormField("lastName", text)}
                            placeholder="Your last name"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 text-sm mb-2">Bio</Text>
                        <TextInput
                            className="border border-gray-200 rounded-lg px-3 py-3 text-base"
                            value={formData.bio}
                            onChangeText={(text) => updateFormField("bio", text)}
                            placeholder="Tell us about yourself"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 text-sm mb-2">Location</Text>
                        <TextInput
                            className="border border-gray-200 rounded-lg px-3 py-3 text-base"
                            value={formData.location ? formData.location : location?.coords ? `${location.coords.latitude}, ${location.coords.longitude}` : ""}
                            onChangeText={(text) => updateFormField("location", text)}
                            placeholder="Where are you located?"
                        />
                        {/* location button */}
                        <TouchableOpacity
                            onPress={
                                addLocation
                            }
                            className="flex items-end mt-2"
                        >
                            <Text className="text-blue-500 text-sm mt-2">Use current location <Feather name="map-pin" size={20} color="#1DA1F2" /> </Text>

                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    );
};

export default EditProfileModal;
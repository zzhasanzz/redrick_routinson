import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { Box, Heading, Text, Button, useToast } from "@chakra-ui/react";

const Redeem = () => {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get("eventId");
    const userEmail = searchParams.get("userEmail");
    const foodItem = searchParams.get("foodItem");
    const [status, setStatus] = useState("Verifying...");
    const toast = useToast();

    useEffect(() => {
        const redeemFoodToken = async () => {
            if (!eventId || !userEmail || !foodItem) {
                setStatus("Invalid QR Code.");
                return;
            }

            try {
                const eventDocRef = doc(db, "events", eventId);
                const eventDoc = await getDoc(eventDocRef);

                if (eventDoc.exists()) {
                    let eventData = eventDoc.data();
                    let redeemedTokens = eventData.redeemedTokens || {};

                    // ✅ Check if token was already used
                    if (redeemedTokens[userEmail]?.includes(foodItem)) {
                        setStatus(`Food already claimed for ${foodItem}.`);
                        return;
                    }

                    // ✅ Mark token as used
                    await updateDoc(eventDocRef, {
                        [`redeemedTokens.${userEmail}`]: arrayUnion(foodItem),
                    });

                    setStatus(`✅ Successfully redeemed: ${foodItem}`);
                    toast({
                        title: "Success",
                        description: `${foodItem} redeemed for ${userEmail}`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });

                } else {
                    setStatus("Event not found.");
                }
            } catch (error) {
                console.error("Error redeeming QR:", error);
                setStatus("Error processing QR code.");
            }
        };

        redeemFoodToken();
    }, [eventId, userEmail, foodItem]);

    return (
        <Box textAlign="center" p={5}>
            <Heading>QR Code Redemption</Heading>
            <Text mt={4} fontSize="lg">{status}</Text>
            <Button colorScheme="blue" mt={5} onClick={() => window.location.href = "/"}>
                Go Back to Events
            </Button>
        </Box>
    );
};

export default Redeem;

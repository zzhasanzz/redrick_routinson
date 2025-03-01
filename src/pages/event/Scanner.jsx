import React, { useState, useRef } from "react";
import { QrReader } from "react-qr-reader";  // QR Scanner Library
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { Box, Heading, Text, Button, useToast } from "@chakra-ui/react";

const SCAN_COOLDOWN = 2000; // Cooldown period (2 seconds)

const FoodScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const isScanning = useRef(false); // ✅ Ref prevents multiple scans
    const toast = useToast();

    const handleScan = async (result) => {
        if (!result?.text || isScanning.current) return;  // ✅ Ignore duplicate scans
        isScanning.current = true; // ✅ Set scanning lock to prevent multiple scans

        const scannedData = result.text.trim();
        setScanResult(scannedData);

        const [eventId, userEmail, foodItem] = scannedData.split("-");
        console.log("Scanned:", { eventId, userEmail, foodItem });

        if (!eventId || !userEmail || !foodItem) {
            toast({
                title: "Invalid QR Code",
                description: "This QR code is not recognized.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
            resetScanning();
            return;
        }

        try {
            const eventDocRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                let eventData = eventDoc.data();

                // ✅ Ensure food tracking arrays exist
                let foodTrackingArray = eventData[foodItem] || [];
                let participantIndex = eventData.participantList.indexOf(userEmail);

                if (participantIndex === -1) {
                    toast({
                        title: "Not Registered",
                        description: "This user is not registered for the event.",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    resetScanning();
                    return;
                }

                // ✅ Check if the participant already claimed this food item
                if (foodTrackingArray.includes(participantIndex)) {
                    toast({
                        title: "Already Claimed",
                        description: `You have already taken ${foodItem}.`,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    resetScanning();
                    return;
                }

                // ✅ Mark the food item as claimed by adding the participant index
                await updateDoc(eventDocRef, {
                    [foodItem]: arrayUnion(participantIndex) // Prevents duplicate claims
                });

                toast({
                    title: "Success",
                    description: `You successfully claimed ${foodItem}.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

            } else {
                toast({
                    title: "Event Not Found",
                    description: "This event does not exist.",
                    status: "error",
                    duration: 2000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error scanning QR:", error);
            toast({
                title: "Error",
                description: "Failed to process QR. Try again.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        }

        resetScanning(); // ✅ Reset scan lock after cooldown
    };

    // ✅ Reset scanning flag after cooldown
    const resetScanning = () => {
        setTimeout(() => {
            isScanning.current = false;
        }, SCAN_COOLDOWN);
    };

    return (
        <Box textAlign="center" p={5}>
            <Heading>Scan Food Token</Heading>

            <QrReader
                onResult={(result, error) => {
                    if (result) handleScan(result);
                    if (error) console.error("QR Scan Error:", error);
                }}
                constraints={{ facingMode: "environment" }}
                style={{ width: "100%", maxWidth: "400px", margin: "auto" }}
            />

            {scanResult && <Text mt={4}>Scanned: {scanResult}</Text>}

            <Button
                colorScheme="blue"
                mt={5}
                onClick={() => {
                    setScanResult(null);
                    isScanning.current = false; // ✅ Reset scanning flag manually if needed
                }}
            >
                Reset Scanner
            </Button>
        </Box>
    );
};

export default FoodScanner;

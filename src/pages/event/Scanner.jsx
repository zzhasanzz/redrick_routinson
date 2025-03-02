import React, { useState, useRef } from "react";
import { QrReader } from "react-qr-reader";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { Box, Heading, Text, Button, useToast } from "@chakra-ui/react";

const SCAN_COOLDOWN = 2000;

const FoodScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const isScanning = useRef(false);
    const toast = useToast();

    const handleScan = async (result) => {
        if (!result?.text || isScanning.current) return;
        isScanning.current = true;

        const scannedData = result.text.trim();
        setScanResult(scannedData);

        const [eventId, userEmail, foodItem] = scannedData.split("-");

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
                const eventData = eventDoc.data();

                // Check if participant exists
                const participantExists = eventData.participantList?.some(
                    p => p.email === userEmail
                );

                if (!participantExists) {
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

                // Get food tracking array
                let foodTrackingArray = eventData[foodItem.toLowerCase()] || [];

                // Check if already claimed
                if (foodTrackingArray.includes(userEmail)) {
                    toast({
                        title: "Already Claimed",
                        description: `${userEmail} already claimed ${foodItem}.`,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    resetScanning();
                    return;
                }

                // Update food tracking with user email instead of index
                await updateDoc(eventDocRef, {
                    [foodItem.toLowerCase()]: arrayUnion(userEmail)
                });

                toast({
                    title: "Success",
                    description: `${userEmail} successfully claimed ${foodItem}.`,
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

        resetScanning();
    };

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
                    isScanning.current = false;
                }}
            >
                Reset Scanner
            </Button>
        </Box>
    );
};

export default FoodScanner;
import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Box, Heading, Text, Button, useToast } from "@chakra-ui/react";

const FoodScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const toast = useToast();

    const handleScan = async (result) => {
        if (!result || !isScanning || isProcessing) return;
        setIsProcessing(true);

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
            setIsProcessing(false);
            return;
        }

        try {
            const eventDocRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                let eventData = eventDoc.data();
                let foodStatus = eventData.foodStatus || {};

                // ✅ Check if food is already received
                if (foodStatus[userEmail]?.[foodItem] === "Received") {
                    toast({
                        title: "Already Taken",
                        description: `${foodItem} was already claimed!`,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    setIsScanning(false);
                    setIsProcessing(false);
                    return;
                }

                // ✅ Update food status to "Received"
                await updateDoc(eventDocRef, {
                    [`foodStatus.${userEmail}.${foodItem}`]: "Received",
                });

                toast({
                    title: "Success",
                    description: `${foodItem} redeemed for ${userEmail}`,
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });

                setIsScanning(false);

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

        setIsProcessing(false);
    };

    return (
        <Box textAlign="center" p={5}>
            <Heading>Scan Food Token</Heading>

            {isScanning ? (
                <QrReader
                    onResult={(result, error) => {
                        if (result) handleScan(result);
                        if (error) console.error("QR Scan Error:", error);
                    }}
                    constraints={{ facingMode: "environment" }}
                />
            ) : (
                <Text fontSize="lg" mt={4}>✅ Scanning Stopped</Text>
            )}

            {scanResult && <Text mt={4}>Scanned: {scanResult}</Text>}

            <Button
                colorScheme="blue"
                mt={5}
                onClick={() => {
                    setScanResult(null);
                    setIsScanning(true);
                    setIsProcessing(false);
                }}
            >
                Reset Scanner
            </Button>
        </Box>
    );
};

export default FoodScanner;

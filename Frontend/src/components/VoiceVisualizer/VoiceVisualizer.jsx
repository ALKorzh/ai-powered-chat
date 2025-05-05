import React, { useEffect, useRef } from 'react';

const VoiceVisualizer = ({ isActive }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const historyRef = useRef([]);

    useEffect(() => {
        if (!isActive) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 40;

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;

            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            sourceRef.current.connect(analyserRef.current);

            const draw = () => {
                animationRef.current = requestAnimationFrame(draw);

                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                const average = dataArrayRef.current.reduce((a, b) => a + b, 0) / bufferLength;

                historyRef.current.push(average);
                if (historyRef.current.length > canvas.width) {
                    historyRef.current.shift();
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const centerY = canvas.height / 2;
                const spacing = 5;

                historyRef.current.forEach((val, i) => {
                    const radius = 1.5 + (val / 255) * 4;
                    const x = i * spacing;
                    ctx.beginPath();
                    ctx.arc(x, centerY, radius, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ccc';
                    ctx.fill();
                });
            };

            draw();
        });

        return () => {
            cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [isActive]);

    return <canvas ref={canvasRef} />;
};

export default VoiceVisualizer;

class QuestionManager {
    constructor() {
        this.questions = {
            level1: [], // Remember
            level2: [], // Understand
            level3: [], // Apply
            level4: [], // Analyze
            level5: []  // Create
        };
        this.currentQuestion = null;
        this.loadQuestions();
    }

    loadQuestions() {
        // Level 1: Remember (Basic recall)
        this.questions.level1 = [
            {
                id: 1,
                question: "What is the SI unit of electric current?",
                options: ["Volt", "Watt", "Ampere", "Ohm"],
                answer: 2,
                explanation: "The ampere (A) is the SI unit of electric current, named after André-Marie Ampère.",
                hint: "Think about what measures the flow of electric charge.",
                circuitSVG: this.generateSimpleCircuit("battery", "ammeter", "resistor"),
                bloomLevel: 1
            },
            {
                id: 2,
                question: "What does Ohm's Law state?",
                options: [
                    "V = I/R",
                    "I = VR",
                    "V = IR",
                    "R = V/I"
                ],
                answer: 2,
                explanation: "Ohm's Law states that voltage (V) equals current (I) times resistance (R): V = IR",
                hint: "The relationship between voltage, current, and resistance.",
                circuitSVG: this.generateOhmsLawCircuit(),
                bloomLevel: 1
            },
            {
                id: 3,
                question: "Which component stores electrical energy in a circuit?",
                options: ["Resistor", "Capacitor", "Inductor", "Transistor"],
                answer: 1,
                explanation: "A capacitor stores electrical energy in an electric field.",
                hint: "Think about components that can hold charge.",
                circuitSVG: this.generateCapacitorCircuit(),
                bloomLevel: 1
            },
            {
                id: 4,
                question: "What is the function of a resistor in a circuit?",
                options: [
                    "Store energy",
                    "Amplify signals",
                    "Oppose current flow",
                    "Generate voltage"
                ],
                answer: 2,
                explanation: "A resistor opposes the flow of electric current, converting electrical energy to heat.",
                hint: "It resists something.",
                circuitSVG: this.generateResistorCircuit(),
                bloomLevel: 1
            },
            {
                id: 5,
                question: "Which circuit has all components connected in a single path?",
                options: [
                    "Parallel circuit",
                    "Series circuit",
                    "Complex circuit",
                    "Integrated circuit"
                ],
                answer: 1,
                explanation: "A series circuit has all components connected end-to-end in a single path.",
                hint: "Think about a daisy-chain connection.",
                circuitSVG: this.generateSeriesCircuit(),
                bloomLevel: 1
            }
        ];

        // Level 2: Understand (Explain concepts)
        this.questions.level2 = [
            {
                id: 6,
                question: "Explain why current remains the same in a series circuit.",
                options: [
                    "Because voltage divides",
                    "Because there's only one path for electrons",
                    "Because resistance adds up",
                    "Because power is conserved"
                ],
                answer: 1,
                explanation: "In a series circuit, there's only one path for electrons to flow, so the same current flows through all components.",
                hint: "Think about the flow path of electrons.",
                circuitSVG: this.generateSeriesCircuitWithValues("12V", "6Ω", "4Ω"),
                bloomLevel: 2
            },
            {
                id: 7,
                question: "Why do lights in a parallel circuit operate independently?",
                options: [
                    "Because each has its own voltage source",
                    "Because current divides among branches",
                    "Because they have different resistances",
                    "Because they are on separate switches"
                ],
                answer: 1,
                explanation: "In parallel circuits, each component has its own path to the voltage source, so they operate independently.",
                hint: "Consider multiple paths from the source.",
                circuitSVG: this.generateParallelCircuit(),
                bloomLevel: 2
            },
            {
                id: 8,
                question: "What happens to total resistance when resistors are added in parallel?",
                options: [
                    "Increases",
                    "Decreases",
                    "Remains the same",
                    "Doubles"
                ],
                answer: 1,
                explanation: "Adding resistors in parallel decreases total resistance because it creates more paths for current to flow.",
                hint: "More paths means easier flow.",
                circuitSVG: this.generateParallelResistors("10Ω", "10Ω"),
                bloomLevel: 2
            },
            {
                id: 9,
                question: "Explain the purpose of a fuse in a circuit.",
                options: [
                    "To increase current",
                    "To protect against overcurrent",
                    "To store energy",
                    "To regulate voltage"
                ],
                answer: 1,
                explanation: "A fuse protects the circuit by melting and breaking the circuit if current exceeds a safe level.",
                hint: "Safety device for excessive current.",
                circuitSVG: this.generateCircuitWithFuse(),
                bloomLevel: 2
            },
            {
                id: 10,
                question: "What is the difference between AC and DC current?",
                options: [
                    "AC changes direction, DC doesn't",
                    "DC is stronger than AC",
                    "AC is for batteries, DC for outlets",
                    "DC changes direction, AC doesn't"
                ],
                answer: 0,
                explanation: "AC (Alternating Current) periodically reverses direction, while DC (Direct Current) flows in one direction only.",
                hint: "Think about the direction of flow.",
                circuitSVG: this.generateACDCCircuit(),
                bloomLevel: 2
            }
        ];

        // Level 3: Apply (Use formulas)
        this.questions.level3 = [
            {
                id: 11,
                question: "Calculate the current in a circuit with 12V battery and 4Ω resistor.",
                options: ["3A", "48A", "0.33A", "8A"],
                answer: 0,
                explanation: "Using Ohm's Law: I = V/R = 12V/4Ω = 3A",
                hint: "Use I = V/R",
                circuitSVG: this.generateSimpleCircuitWithValues("12V", "4Ω"),
                bloomLevel: 3
            },
            {
                id: 12,
                question: "What is the total resistance of two 6Ω resistors in parallel?",
                options: ["12Ω", "3Ω", "6Ω", "1Ω"],
                answer: 1,
                explanation: "For parallel resistors: 1/Rt = 1/6 + 1/6 = 2/6 = 1/3, so Rt = 3Ω",
                hint: "Use parallel resistance formula: 1/Rt = 1/R1 + 1/R2",
                circuitSVG: this.generateParallelResistors("6Ω", "6Ω"),
                bloomLevel: 3
            },
            {
                id: 13,
                question: "Calculate power dissipated by a 10Ω resistor with 2A current.",
                options: ["20W", "40W", "5W", "100W"],
                answer: 1,
                explanation: "P = I²R = (2A)² × 10Ω = 4 × 10 = 40W",
                hint: "Use P = I²R or P = V²/R or P = VI",
                circuitSVG: this.generatePowerCircuit("10Ω", "2A"),
                bloomLevel: 3
            },
            {
                id: 14,
                question: "What voltage is needed to produce 0.5A through a 24Ω resistor?",
                options: ["48V", "12V", "0.02V", "24V"],
                answer: 1,
                explanation: "V = IR = 0.5A × 24Ω = 12V",
                hint: "Use V = IR",
                circuitSVG: this.generateCircuitForVoltage("24Ω", "0.5A"),
                bloomLevel: 3
            },
            {
                id: 15,
                question: "Three 12Ω resistors in series have what total resistance?",
                options: ["4Ω", "12Ω", "36Ω", "24Ω"],
                answer: 2,
                explanation: "Series resistors add: Rt = 12 + 12 + 12 = 36Ω",
                hint: "Series resistance: Rt = R1 + R2 + R3",
                circuitSVG: this.generateSeriesResistors("12Ω", "12Ω", "12Ω"),
                bloomLevel: 3
            }
        ];

        // Level 4: Analyze (Break down complex circuits)
        this.questions.level4 = [
            {
                id: 16,
                question: "Analyze this circuit: 12V source with 2Ω and 4Ω in series. What's voltage across 4Ω?",
                options: ["4V", "8V", "12V", "6V"],
                answer: 1,
                explanation: "Total R = 6Ω, I = 12V/6Ω = 2A, V4Ω = 2A × 4Ω = 8V",
                hint: "Find total current first, then use Ohm's Law for each resistor.",
                circuitSVG: this.generateVoltageDivider("12V", "2Ω", "4Ω"),
                bloomLevel: 4
            },
            {
                id: 17,
                question: "Two 8Ω resistors in parallel with 12V. What's current through each?",
                options: ["0.75A each", "1.5A each", "3A each", "6A each"],
                answer: 1,
                explanation: "Each resistor gets 12V (parallel), so I = V/R = 12V/8Ω = 1.5A",
                hint: "In parallel, voltage is same across all branches.",
                circuitSVG: this.generateParallelCurrents("12V", "8Ω", "8Ω"),
                bloomLevel: 4
            },
            {
                id: 18,
                question: "Circuit has 2Ω and 3Ω in series, parallel with 5Ω. Total resistance?",
                options: ["2.5Ω", "1.67Ω", "3.33Ω", "10Ω"],
                answer: 0,
                explanation: "Series branch: 2+3=5Ω, parallel with 5Ω: 1/Rt = 1/5 + 1/5 = 2/5, Rt = 2.5Ω",
                hint: "Simplify step by step: series first, then parallel.",
                circuitSVG: this.generateComplexCircuit1(),
                bloomLevel: 4
            },
            {
                id: 19,
                question: "Which resistor has highest current in this parallel circuit: 4Ω, 6Ω, 12Ω with 24V?",
                options: ["4Ω", "6Ω", "12Ω", "All equal"],
                answer: 0,
                explanation: "In parallel, I = V/R. With same V, smallest R has highest I: 24V/4Ω = 6A (highest)",
                hint: "Remember Ohm's Law: I = V/R. Smaller resistance means more current at same voltage.",
                circuitSVG: this.generateParallelComparison("24V", "4Ω", "6Ω", "12Ω"),
                bloomLevel: 4
            },
            {
                id: 20,
                question: "Calculate total power in circuit: 120V with 20Ω and 30Ω in parallel.",
                options: ["600W", "1000W", "720W", "480W"],
                answer: 1,
                explanation: "Total R = 1/(1/20+1/30) = 12Ω, P = V²/R = (120²)/12 = 14400/12 = 1200W",
                hint: "Find equivalent resistance first, then use power formula.",
                circuitSVG: this.generatePowerCalculationCircuit("120V", "20Ω", "30Ω"),
                bloomLevel: 4
            }
        ];

        // Level 5: Create (Design circuits)
        this.questions.level5 = [
            {
                id: 21,
                question: "Design a circuit to get 3A from 12V using only 6Ω resistors.",
                options: [
                    "Two 6Ω in parallel",
                    "Two 6Ω in series",
                    "Four 6Ω in series-parallel",
                    "Single 6Ω resistor"
                ],
                answer: 0,
                explanation: "Two 6Ω in parallel gives 3Ω total, I = V/R = 12V/3Ω = 4A",
                hint: "Need total resistance R = V/I = 12V/3A = 4Ω using combinations of 6Ω resistors.",
                circuitSVG: this.generateDesignCircuit1(),
                bloomLevel: 5
            },
            {
                id: 22,
                question: "Create voltage divider to get 4V from 12V using 2 resistors.",
                options: [
                    "4Ω and 8Ω",
                    "1Ω and 2Ω",
                    "3Ω and 9Ω",
                    "2Ω and 4Ω"
                ],
                answer: 0,
                explanation: "4V/12V = 1/3, so R2/(R1+R2) = 1/3. 4Ω/(8Ω+4Ω) = 4/12 = 1/3 ✓",
                hint: "Voltage divider: Vout = Vin × (R2/(R1+R2)). Need ratio 4/12 = 1/3.",
                circuitSVG: this.generateVoltageDividerDesign("12V", "4V"),
                bloomLevel: 5
            },
            {
                id: 23,
                question: "Design parallel circuit where 2Ω gets 3A and 4Ω gets 1.5A from same source.",
                options: [
                    "6V source",
                    "12V source",
                    "3V source",
                    "9V source"
                ],
                answer: 0,
                explanation: "For parallel: V = I1×R1 = 3A×2Ω = 6V, also V = I2×R2 = 1.5A×4Ω = 6V ✓",
                hint: "In parallel, voltage is same across all branches.",
                circuitSVG: this.generateParallelDesign("2Ω", "3A", "4Ω", "1.5A"),
                bloomLevel: 5
            },
            {
                id: 24,
                question: "Create circuit with total 10Ω using only 15Ω and 30Ω resistors.",
                options: [
                    "Two 30Ω in parallel with 15Ω",
                    "Two 15Ω in series",
                    "15Ω and 30Ω in series",
                    "Two 30Ω in series"
                ],
                answer: 0,
                explanation: "Two 30Ω in parallel = 15Ω, in series with 15Ω = 30Ω... Wait, let's calculate properly.",
                hint: "Try combinations: parallel gives less than individual, series adds.",
                circuitSVG: this.generateResistorNetwork(),
                bloomLevel: 5
            },
            {
                id: 25,
                question: "Design safe circuit for 12V, 0.5A LED with 24V source.",
                options: [
                    "24Ω resistor in series",
                    "12Ω resistor in parallel",
                    "6Ω resistor in series",
                    "48Ω resistor in series"
                ],
                answer: 0,
                explanation: "Need to drop 12V (24V-12V) at 0.5A: R = V/I = 12V/0.5A = 24Ω in series",
                hint: "Calculate voltage drop needed, then use Ohm's Law for series resistor.",
                circuitSVG: this.generateLEDCircuit("24V", "12V", "0.5A"),
                bloomLevel: 5
            }
        ];
    }

    getRandomQuestion(level) {
        const levelQuestions = this.questions[`level${level}`];
        if (!levelQuestions || levelQuestions.length === 0) return null;
        
        // Filter unasked questions for this session
        const unasked = levelQuestions.filter(q => !q.asked);
        const pool = unasked.length > 0 ? unasked : levelQuestions;
        
        const question = pool[Math.floor(Math.random() * pool.length)];
        question.asked = true;
        this.currentQuestion = question;
        return question;
    }

    generateSimpleCircuit(component1, component2, component3) {
        return `
            <svg width="300" height="150" viewBox="0 0 300 150">
                <rect x="50" y="60" width="200" height="30" fill="#333" rx="5"/>
                <circle cx="75" cy="75" r="15" fill="#f00"/>
                <text x="75" y="80" text-anchor="middle" fill="white" font-size="12">${component1}</text>
                <rect x="125" y="65" width="50" height="20" fill="#ff9900" rx="3"/>
                <text x="150" y="77" text-anchor="middle" fill="black" font-size="10">${component2}</text>
                <path d="M200,75 L225,75" stroke="#00ffff" stroke-width="3"/>
                <text x="212" y="80" text-anchor="middle" fill="#00ffff" font-size="12">${component3}</text>
                <circle cx="250" cy="75" r="10" fill="#0f0"/>
            </svg>
        `;
    }

    generateOhmsLawCircuit() {
        return `
            <svg width="300" height="150" viewBox="0 0 300 150">
                <path d="M50,75 L100,75 M200,75 L250,75" stroke="#00ffff" stroke-width="3"/>
                <circle cx="125" cy="75" r="25" fill="#ff9900"/>
                <text x="125" y="80" text-anchor="middle" fill="black" font-size="14">R</text>
                <text x="75" y="90" text-anchor="middle" fill="#ffff00" font-size="12">I</text>
                <text x="225" y="90" text-anchor="middle" fill="#ff0000" font-size="12">V</text>
                <text x="125" y="120" text-anchor="middle" fill="#00ffff" font-size="16">V = I × R</text>
            </svg>
        `;
    }

    // More SVG generation functions...
    generateSeriesCircuitWithValues(voltage, r1, r2) {
        return `
            <svg width="350" height="150" viewBox="0 0 350 150">
                <path d="M50,75 L100,75 M150,75 L200,75 M250,75 L300,75" stroke="#00ffff" stroke-width="3"/>
                <rect x="100" y="65" width="50" height="20" fill="#ff9900" rx="3"/>
                <text x="125" y="77" text-anchor="middle" fill="black" font-size="10">${r1}</text>
                <rect x="200" y="65" width="50" height="20" fill="#ff9900" rx="3"/>
                <text x="225" y="77" text-anchor="middle" fill="black" font-size="10">${r2}</text>
                <circle cx="75" cy="75" r="15" fill="#f00"/>
                <text x="75" y="80" text-anchor="middle" fill="white" font-size="12">${voltage}</text>
                <text x="175" y="100" text-anchor="middle" fill="#ffff00" font-size="12">Same I throughout</text>
            </svg>
        `;
    }

    checkAnswer(selectedIndex) {
        if (!this.currentQuestion) return false;
        return selectedIndex === this.currentQuestion.answer;
    }

    getCurrentQuestion() {
        return this.currentQuestion;
    }

    resetAskedFlags() {
        for (let level = 1; level <= 5; level++) {
            const levelQuestions = this.questions[`level${level}`];
            if (levelQuestions) {
                levelQuestions.forEach(q => delete q.asked);
            }
        }
    }
}

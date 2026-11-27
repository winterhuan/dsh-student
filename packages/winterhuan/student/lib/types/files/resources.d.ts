/** Authoring resources derive structural constraints from the shared input schemas. */
import { z } from 'zod';
declare const schemas: {
    'capability-goal': z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        domain: z.ZodString;
        title: z.ZodString;
        scope: z.ZodString;
        criterion: z.ZodString;
        prerequisites: z.ZodArray<z.ZodString>;
        familyIds: z.ZodArray<z.ZodString>;
        sourceIds: z.ZodArray<z.ZodString>;
        curriculumAssociationIds: z.ZodArray<z.ZodString>;
        titleEn: z.ZodOptional<z.ZodString>;
        criterionEn: z.ZodOptional<z.ZodString>;
        curriculumAssociationGap: z.ZodOptional<z.ZodString>;
        coverageStatus: z.ZodOptional<z.ZodString>;
        activation: z.ZodOptional<z.ZodString>;
        evidenceRequirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
        progressKind: z.ZodOptional<z.ZodString>;
        prerequisitePolicy: z.ZodOptional<z.ZodString>;
        requirementIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        sourceLocators: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourceId: z.ZodString;
            pdfPages: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            section: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    'question-family': z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        coreMethod: z.ZodString;
        structure: z.ZodString;
        goalIds: z.ZodArray<z.ZodString>;
        variationAxes: z.ZodArray<z.ZodString>;
        boundary: z.ZodString;
        representative: z.ZodObject<{
            id: z.ZodString;
            prompt: z.ZodString;
            rubric: z.ZodString;
            stimulus: z.ZodOptional<z.ZodJSONSchema>;
        }, z.core.$strict>;
        signature: z.ZodObject<{
            capabilityIds: z.ZodArray<z.ZodString>;
            coreMethod: z.ZodString;
            problemStructure: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    'knowledge-extension': z.ZodObject<{
        goals: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            domain: z.ZodString;
            title: z.ZodString;
            scope: z.ZodString;
            criterion: z.ZodString;
            prerequisites: z.ZodArray<z.ZodString>;
            familyIds: z.ZodArray<z.ZodString>;
            sourceIds: z.ZodArray<z.ZodString>;
            curriculumAssociationIds: z.ZodArray<z.ZodString>;
            titleEn: z.ZodOptional<z.ZodString>;
            criterionEn: z.ZodOptional<z.ZodString>;
            curriculumAssociationGap: z.ZodOptional<z.ZodString>;
            coverageStatus: z.ZodOptional<z.ZodString>;
            activation: z.ZodOptional<z.ZodString>;
            evidenceRequirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
            progressKind: z.ZodOptional<z.ZodString>;
            prerequisitePolicy: z.ZodOptional<z.ZodString>;
            requirementIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            sourceLocators: z.ZodOptional<z.ZodArray<z.ZodObject<{
                sourceId: z.ZodString;
                pdfPages: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                section: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
        families: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            coreMethod: z.ZodString;
            structure: z.ZodString;
            goalIds: z.ZodArray<z.ZodString>;
            variationAxes: z.ZodArray<z.ZodString>;
            boundary: z.ZodString;
            representative: z.ZodObject<{
                id: z.ZodString;
                prompt: z.ZodString;
                rubric: z.ZodString;
                stimulus: z.ZodOptional<z.ZodJSONSchema>;
            }, z.core.$strict>;
            signature: z.ZodObject<{
                capabilityIds: z.ZodArray<z.ZodString>;
                coreMethod: z.ZodString;
                problemStructure: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    'openmaic-lessons': z.ZodObject<{
        format: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        lessons: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            status: z.ZodEnum<{
                planned: "planned";
                unknown: "unknown";
                generating: "generating";
                ready: "ready";
                failed: "failed";
            }>;
            purpose: z.ZodOptional<z.ZodEnum<{
                full: "full";
                foundation: "foundation";
                synthesis: "synthesis";
            }>>;
            course: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                sectionId: z.ZodString;
                revision: z.ZodNumber;
                materialRevision: z.ZodString;
            }, z.core.$strict>>;
            teaching: z.ZodOptional<z.ZodObject<{
                revision: z.ZodString;
                goal: z.ZodString;
                scope: z.ZodString;
                materialLimitations: z.ZodString;
                introduction: z.ZodString;
                explanation: z.ZodString;
                demonstration: z.ZodString;
                guidedPractice: z.ZodString;
                independentPractice: z.ZodString;
                summary: z.ZodString;
                maxAssessmentQuestions: z.ZodNumber;
            }, z.core.$strict>>;
            quality: z.ZodOptional<z.ZodObject<{
                reviewId: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    passed: "passed";
                    rejected: "rejected";
                }>;
                checkedAt: z.ZodNumber;
                contentHash: z.ZodString;
                stages: z.ZodObject<{
                    introduction: z.ZodString;
                    explanation: z.ZodString;
                    demonstration: z.ZodString;
                    guidedPractice: z.ZodString;
                    independentPractice: z.ZodString;
                    summary: z.ZodString;
                }, z.core.$strict>;
                questions: z.ZodArray<z.ZodObject<{
                    sceneId: z.ZodString;
                    questionId: z.ZodString;
                    purpose: z.ZodEnum<{
                        example: "example";
                        guided: "guided";
                        assessment: "assessment";
                    }>;
                    rationale: z.ZodString;
                }, z.core.$strict>>;
                scopeChecked: z.ZodLiteral<true>;
                criterionChecked: z.ZodLiteral<true>;
                notes: z.ZodString;
            }, z.core.$strict>>;
            questionPlan: z.ZodOptional<z.ZodObject<{
                revision: z.ZodString;
                source: z.ZodObject<{
                    path: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
                target: z.ZodObject<{
                    scope: z.ZodObject<{
                        id: z.ZodString;
                        description: z.ZodString;
                        modality: z.ZodEnum<{
                            written: "written";
                            oral: "oral";
                            listening: "listening";
                            audiovisual: "audiovisual";
                            performed: "performed";
                        }>;
                        numberMax: z.ZodOptional<z.ZodNumber>;
                        vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    }, z.core.$strict>;
                    goalId: z.ZodString;
                    familyId: z.ZodString;
                }, z.core.$strict>;
                questions: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodEnum<{
                        single: "single";
                        multiple: "multiple";
                        short_answer: "short_answer";
                    }>;
                    question: z.ZodString;
                    options: z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>;
                    answer: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
                    analysis: z.ZodString;
                    sourceQuote: z.ZodString;
                    completedAnswer: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            foundationConfirmation: z.ZodOptional<z.ZodString>;
            replacesLessonId: z.ZodOptional<z.ZodString>;
            sourceLessonIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            activity: z.ZodOptional<z.ZodObject<{
                state: z.ZodEnum<{
                    "not-started": "not-started";
                    learning: "learning";
                    paused: "paused";
                    ended: "ended";
                }>;
                blockId: z.ZodString;
                position: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            title: z.ZodString;
            requirement: z.ZodString;
            subject: z.ZodOptional<z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>>;
            objectiveId: z.ZodOptional<z.ZodString>;
            base: z.ZodString;
            learnerId: z.ZodOptional<z.ZodString>;
            termId: z.ZodOptional<z.ZodString>;
            blockId: z.ZodOptional<z.ZodString>;
            learnerKey: z.ZodOptional<z.ZodString>;
            jobId: z.ZodOptional<z.ZodString>;
            pollUrl: z.ZodOptional<z.ZodString>;
            runId: z.ZodOptional<z.ZodString>;
            commandId: z.ZodOptional<z.ZodString>;
            retryable: z.ZodOptional<z.ZodBoolean>;
            classroomId: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
            warning: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
            feedback: z.ZodOptional<z.ZodObject<{
                bindingId: z.ZodString;
                learnerId: z.ZodString;
                termId: z.ZodString;
                blockId: z.ZodString;
                goalId: z.ZodString;
                familyId: z.ZodString;
                scope: z.ZodObject<{
                    id: z.ZodString;
                    description: z.ZodString;
                    modality: z.ZodEnum<{
                        written: "written";
                        oral: "oral";
                        listening: "listening";
                        audiovisual: "audiovisual";
                        performed: "performed";
                    }>;
                    numberMax: z.ZodOptional<z.ZodNumber>;
                    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            checkpoint: z.ZodOptional<z.ZodObject<{
                bindingId: z.ZodString;
                attempts: z.ZodArray<z.ZodObject<{
                    attemptId: z.ZodString;
                    seq: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            summary: z.ZodOptional<z.ZodObject<{
                fetchedAt: z.ZodString;
                outline: z.ZodString;
                scenes: z.ZodArray<z.ZodObject<{
                    title: z.ZodString;
                    summary: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        courses: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            learnerId: z.ZodString;
            termId: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            unit: z.ZodString;
            revision: z.ZodNumber;
            materials: z.ZodArray<z.ZodObject<{
                revision: z.ZodString;
                edition: z.ZodString;
                sourcePath: z.ZodString;
                sourceRevision: z.ZodString;
                directory: z.ZodArray<z.ZodString>;
                position: z.ZodEnum<{
                    entering: "entering";
                    studying: "studying";
                    finished: "finished";
                }>;
                currentSectionId: z.ZodOptional<z.ZodString>;
                confirmation: z.ZodObject<{
                    quote: z.ZodString;
                    at: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            currentMaterialRevision: z.ZodOptional<z.ZodString>;
            sections: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                goalIds: z.ZodArray<z.ZodString>;
                scope: z.ZodObject<{
                    id: z.ZodString;
                    description: z.ZodString;
                    modality: z.ZodEnum<{
                        written: "written";
                        oral: "oral";
                        listening: "listening";
                        audiovisual: "audiovisual";
                        performed: "performed";
                    }>;
                    numberMax: z.ZodOptional<z.ZodNumber>;
                    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
                kind: z.ZodEnum<{
                    synthesis: "synthesis";
                    lesson: "lesson";
                }>;
                materialRevision: z.ZodOptional<z.ZodString>;
                lessonId: z.ZodOptional<z.ZodString>;
                prerequisiteIds: z.ZodArray<z.ZodString>;
                testPreparation: z.ZodOptional<z.ZodObject<{
                    quote: z.ZodString;
                    at: z.ZodNumber;
                }, z.core.$strict>>;
                advanceConfirmation: z.ZodOptional<z.ZodObject<{
                    quote: z.ZodString;
                    at: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        miniLessons: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            learnerId: z.ZodString;
            termId: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            revision: z.ZodString;
            goalIds: z.ZodArray<z.ZodString>;
            scope: z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                modality: z.ZodEnum<{
                    written: "written";
                    oral: "oral";
                    listening: "listening";
                    audiovisual: "audiovisual";
                    performed: "performed";
                }>;
                numberMax: z.ZodOptional<z.ZodNumber>;
                vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            purpose: z.ZodEnum<{
                explanation: "explanation";
                review: "review";
                temporary: "temporary";
            }>;
            sourceLessonId: z.ZodOptional<z.ZodString>;
            contentPath: z.ZodString;
            contentHash: z.ZodString;
            createdAt: z.ZodNumber;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    figure: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"bar-model">;
        bars: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            segments: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                units: z.ZodNumber;
                style: z.ZodOptional<z.ZodEnum<{
                    solid: "solid";
                    dashed: "dashed";
                }>>;
            }, z.core.$strict>>;
            total: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"money">;
        items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
            "1\u5206": "1分";
            "2\u5206": "2分";
            "5\u5206": "5分";
            "1\u89D2": "1角";
            "2\u89D2": "2角";
            "5\u89D2": "5角";
            "1\u5143": "1元";
            "5\u5143": "5元";
            "10\u5143": "10元";
            "20\u5143": "20元";
            "50\u5143": "50元";
            "100\u5143": "100元";
        }>, z.ZodObject<{
            denomination: z.ZodEnum<{
                "1\u5206": "1分";
                "2\u5206": "2分";
                "5\u5206": "5分";
                "1\u89D2": "1角";
                "2\u89D2": "2角";
                "5\u89D2": "5角";
                "1\u5143": "1元";
                "5\u5143": "5元";
                "10\u5143": "10元";
                "20\u5143": "20元";
                "50\u5143": "50元";
                "100\u5143": "100元";
            }>;
            count: z.ZodNumber;
        }, z.core.$strict>]>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"place-value">;
        tens: z.ZodNumber;
        ones: z.ZodNumber;
        crossTens: z.ZodNumber;
        crossOnes: z.ZodNumber;
        regroup: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"hundred-chart">;
        hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        window: z.ZodOptional<z.ZodObject<{
            center: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"number-line">;
        from: z.ZodNumber;
        to: z.ZodNumber;
        step: z.ZodNumber;
        marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodNumber;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
            from: z.ZodNumber;
            to: z.ZodNumber;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"clock">;
        clocks: z.ZodArray<z.ZodObject<{
            hour: z.ZodNumber;
            minute: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"sticks">;
        bundles: z.ZodNumber;
        singles: z.ZodNumber;
        crossBundles: z.ZodOptional<z.ZodNumber>;
        crossSingles: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"vertical">;
        count: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"shapes">;
        rows: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            shape: z.ZodEnum<{
                circle: "circle";
                square: "square";
                triangle: "triangle";
            }>;
            count: z.ZodNumber;
            blank: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"overlap">;
        left: z.ZodString;
        right: z.ZodString;
        leftOnly: z.ZodString;
        both: z.ZodString;
        rightOnly: z.ZodString;
        total: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"split">;
        parts: z.ZodArray<z.ZodObject<{
            top: z.ZodString;
            left: z.ZodString;
            right: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"sequence">;
        items: z.ZodArray<z.ZodObject<{
            shape: z.ZodEnum<{
                circle: "circle";
                square: "square";
                triangle: "triangle";
                star: "star";
            }>;
            count: z.ZodNumber;
        }, z.core.$strict>>;
        blank: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"wall">;
        rows: z.ZodArray<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"grid">;
        columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
        rows: z.ZodArray<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            cells: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"dot-array">;
        rows: z.ZodNumber;
        columns: z.ZodNumber;
        total: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"plane">;
        items: z.ZodArray<z.ZodObject<{
            shape: z.ZodEnum<{
                circle: "circle";
                square: "square";
                triangle: "triangle";
                rectangle: "rectangle";
                quadrilateral: "quadrilateral";
                curved: "curved";
            }>;
            count: z.ZodNumber;
        }, z.core.$strict>>;
        mark: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"solid">;
        items: z.ZodArray<z.ZodObject<{
            shape: z.ZodEnum<{
                cube: "cube";
                cuboid: "cuboid";
                cylinder: "cylinder";
                sphere: "sphere";
            }>;
            count: z.ZodNumber;
        }, z.core.$strict>>;
        mark: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"counter">;
        hundreds: z.ZodNumber;
        tens: z.ZodNumber;
        ones: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"measure">;
        bars: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            length: z.ZodNumber;
            style: z.ZodOptional<z.ZodEnum<{
                curved: "curved";
                straight: "straight";
            }>>;
        }, z.core.$strict>>;
        ruler: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"compass">;
        blank: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"balance">;
        left: z.ZodString;
        right: z.ZodString;
        tilt: z.ZodEnum<{
            left: "left";
            right: "right";
            level: "level";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"writing">;
        style: z.ZodEnum<{
            tianzige: "tianzige";
            fourline: "fourline";
        }>;
        count: z.ZodOptional<z.ZodNumber>;
        example: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"sketch">;
        height: z.ZodNumber;
        elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            draw: z.ZodLiteral<"line">;
            from: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            to: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"polyline">;
            points: z.ZodArray<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>>;
            closed: z.ZodOptional<z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"rect">;
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"circle">;
            x: z.ZodNumber;
            y: z.ZodNumber;
            radius: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"text">;
            x: z.ZodNumber;
            y: z.ZodNumber;
            label: z.ZodString;
            align: z.ZodOptional<z.ZodEnum<{
                center: "center";
                left: "left";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"arrow">;
            from: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            to: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>], "draw">>;
    }, z.core.$strict>], "kind">;
    'term-settings': z.ZodObject<{
        kind: z.ZodLiteral<"term-settings">;
        revision: z.ZodNumber;
        updatedAt: z.ZodNumber;
        profile: z.ZodObject<{
            region: z.ZodString;
            grade: z.ZodNumber;
            term: z.ZodEnum<{
                first: "first";
                second: "second";
            }>;
            schoolYear: z.ZodString;
            schoolSystem: z.ZodEnum<{
                "five-four": "five-four";
                "six-three": "six-three";
            }>;
            nickname: z.ZodString;
            schoolAlias: z.ZodString;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>;
        materials: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            scope: z.ZodObject<{
                region: z.ZodString;
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                schoolYear: z.ZodString;
                schoolSystem: z.ZodEnum<{
                    "five-four": "five-four";
                    "six-three": "six-three";
                }>;
            }, z.core.$strict>;
            title: z.ZodString;
            publisher: z.ZodString;
            edition: z.ZodString;
            editionStatus: z.ZodEnum<{
                unconfirmed: "unconfirmed";
                identified: "identified";
            }>;
            kind: z.ZodEnum<{
                "official-textbook": "official-textbook";
                "school-material": "school-material";
                reference: "reference";
                generated: "generated";
            }>;
            locator: z.ZodString;
            evidence: z.ZodString;
        }, z.core.$strict>>;
        courses: z.ZodArray<z.ZodObject<{
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            materialId: z.ZodString;
            unit: z.ZodString;
            progress: z.ZodOptional<z.ZodObject<{
                unitId: z.ZodString;
                confirmedAt: z.ZodNumber;
                posture: z.ZodEnum<{
                    "keep-up": "keep-up";
                    "catch-up": "catch-up";
                }>;
                preview: z.ZodBoolean;
                pace: z.ZodEnum<{
                    teaching: "teaching";
                    review: "review";
                }>;
            }, z.core.$strict>>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>>;
        learningScopes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            goalIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            scope: z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                modality: z.ZodEnum<{
                    written: "written";
                    oral: "oral";
                    listening: "listening";
                    audiovisual: "audiovisual";
                    performed: "performed";
                }>;
                numberMax: z.ZodOptional<z.ZodNumber>;
                vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>>>;
        interests: z.ZodOptional<z.ZodObject<{
            tags: z.ZodArray<z.ZodString>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>>;
        openmaic: z.ZodOptional<z.ZodObject<{
            baseUrl: z.ZodString;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>>;
        archivedAt: z.ZodOptional<z.ZodNumber>;
        evidenceReferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
            learnerId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").LearnerId, string>>;
            termId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").TermId, string>>;
            ownerKind: z.ZodEnum<{
                block: "block";
                worksheet: "worksheet";
            }>;
            ownerId: z.ZodString;
            responseId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>;
            goalId: z.ZodString;
            scope: z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                modality: z.ZodEnum<{
                    written: "written";
                    oral: "oral";
                    listening: "listening";
                    audiovisual: "audiovisual";
                    performed: "performed";
                }>;
                numberMax: z.ZodOptional<z.ZodNumber>;
                vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            review: z.ZodOptional<z.ZodObject<{
                mistakeId: z.ZodString;
                stage: z.ZodNumber;
                dueAt: z.ZodNumber;
                independentDays: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        retiredEmptyBlocks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").BlockId, string>>;
            backupPath: z.ZodString;
            sha256: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        migration: z.ZodOptional<z.ZodObject<{
            sourcePath: z.ZodString;
            sourceSha256: z.ZodString;
            backupPath: z.ZodString;
        }, z.core.$strict>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").TermId, string>>;
        learnerId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").LearnerId, string>>>;
    }, z.core.$strict>;
    block: z.ZodObject<{
        kind: z.ZodLiteral<"block">;
        id: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").BlockId, string>>;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        mode: z.ZodEnum<{
            foundation: "foundation";
            review: "review";
            school: "school";
            explore: "explore";
            diagnose: "diagnose";
        }>;
        intensity: z.ZodOptional<z.ZodEnum<{
            light: "light";
            standard: "standard";
            deep: "deep";
        }>>;
        startedAt: z.ZodNumber;
        endedAt: z.ZodOptional<z.ZodNumber>;
        spentMs: z.ZodOptional<z.ZodNumber>;
        reflection: z.ZodOptional<z.ZodString>;
        context: z.ZodObject<{
            profile: z.ZodOptional<z.ZodObject<{
                region: z.ZodString;
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                schoolYear: z.ZodString;
                schoolSystem: z.ZodEnum<{
                    "five-four": "five-four";
                    "six-three": "six-three";
                }>;
                nickname: z.ZodString;
                schoolAlias: z.ZodString;
                parentConfirmation: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>;
            pendingProfile: z.ZodOptional<z.ZodString>;
            scope: z.ZodOptional<z.ZodObject<{
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                units: z.ZodOptional<z.ZodArray<z.ZodString>>;
                objectiveIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>;
            material: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                subject: z.ZodEnum<{
                    chinese: "chinese";
                    math: "math";
                    english: "english";
                }>;
                scope: z.ZodObject<{
                    region: z.ZodString;
                    grade: z.ZodNumber;
                    term: z.ZodEnum<{
                        first: "first";
                        second: "second";
                    }>;
                    schoolYear: z.ZodString;
                    schoolSystem: z.ZodEnum<{
                        "five-four": "five-four";
                        "six-three": "six-three";
                    }>;
                }, z.core.$strict>;
                title: z.ZodString;
                publisher: z.ZodString;
                edition: z.ZodString;
                editionStatus: z.ZodEnum<{
                    unconfirmed: "unconfirmed";
                    identified: "identified";
                }>;
                kind: z.ZodEnum<{
                    "official-textbook": "official-textbook";
                    "school-material": "school-material";
                    reference: "reference";
                    generated: "generated";
                }>;
                locator: z.ZodString;
                evidence: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        plan: z.ZodOptional<z.ZodObject<{
            day: z.ZodString;
            taskId: z.ZodString;
        }, z.core.$strict>>;
        currentQuestionId: z.ZodOptional<z.ZodString>;
        questions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            objectiveId: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                kind: z.ZodLiteral<"pending">;
                reason: z.ZodString;
            }, z.core.$strict>]>;
            capability: z.ZodOptional<z.ZodObject<{
                goalId: z.ZodString;
                familyId: z.ZodString;
                scope: z.ZodObject<{
                    id: z.ZodString;
                    description: z.ZodString;
                    modality: z.ZodEnum<{
                        written: "written";
                        oral: "oral";
                        listening: "listening";
                        audiovisual: "audiovisual";
                        performed: "performed";
                    }>;
                    numberMax: z.ZodOptional<z.ZodNumber>;
                    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            mistakeId: z.ZodOptional<z.ZodString>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"authored">;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"exercise">;
                exerciseId: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"mistake">;
                mistakeId: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"legacy">;
                sourcePath: z.ZodString;
                row: z.ZodString;
            }, z.core.$strict>], "kind">;
            topic: z.ZodString;
            prompt: z.ZodString;
            answer: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
            openmaic: z.ZodOptional<z.ZodObject<{
                bindingId: z.ZodString;
                sceneId: z.ZodString;
                questionId: z.ZodString;
                snapshot: z.ZodJSONSchema;
                snapshotHash: z.ZodString;
                revision: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"manifest">;
                    stageRev: z.ZodNumber;
                    sceneRev: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"unavailable">;
                }, z.core.$strict>], "kind">;
            }, z.core.$strict>>;
            basisStatus: z.ZodOptional<z.ZodLiteral<"legacy-pending">>;
            legacyRecord: z.ZodOptional<z.ZodJSONSchema>;
            choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
            steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
            figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"bar-model">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    segments: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        units: z.ZodNumber;
                        style: z.ZodOptional<z.ZodEnum<{
                            solid: "solid";
                            dashed: "dashed";
                        }>>;
                    }, z.core.$strict>>;
                    total: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"money">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>, z.ZodObject<{
                    denomination: z.ZodEnum<{
                        "1\u5206": "1分";
                        "2\u5206": "2分";
                        "5\u5206": "5分";
                        "1\u89D2": "1角";
                        "2\u89D2": "2角";
                        "5\u89D2": "5角";
                        "1\u5143": "1元";
                        "5\u5143": "5元";
                        "10\u5143": "10元";
                        "20\u5143": "20元";
                        "50\u5143": "50元";
                        "100\u5143": "100元";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>]>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"place-value">;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
                crossTens: z.ZodNumber;
                crossOnes: z.ZodNumber;
                regroup: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"hundred-chart">;
                hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                window: z.ZodOptional<z.ZodObject<{
                    center: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"number-line">;
                from: z.ZodNumber;
                to: z.ZodNumber;
                step: z.ZodNumber;
                marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    value: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    from: z.ZodNumber;
                    to: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"clock">;
                clocks: z.ZodArray<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sticks">;
                bundles: z.ZodNumber;
                singles: z.ZodNumber;
                crossBundles: z.ZodOptional<z.ZodNumber>;
                crossSingles: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"vertical">;
                count: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"shapes">;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                    }>;
                    count: z.ZodNumber;
                    blank: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"overlap">;
                left: z.ZodString;
                right: z.ZodString;
                leftOnly: z.ZodString;
                both: z.ZodString;
                rightOnly: z.ZodString;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"split">;
                parts: z.ZodArray<z.ZodObject<{
                    top: z.ZodString;
                    left: z.ZodString;
                    right: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sequence">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        star: "star";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                blank: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"wall">;
                rows: z.ZodArray<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"grid">;
                columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodOptional<z.ZodString>;
                    cells: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"dot-array">;
                rows: z.ZodNumber;
                columns: z.ZodNumber;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"plane">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        rectangle: "rectangle";
                        quadrilateral: "quadrilateral";
                        curved: "curved";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"solid">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        cube: "cube";
                        cuboid: "cuboid";
                        cylinder: "cylinder";
                        sphere: "sphere";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"counter">;
                hundreds: z.ZodNumber;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"measure">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    length: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        curved: "curved";
                        straight: "straight";
                    }>>;
                }, z.core.$strict>>;
                ruler: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"compass">;
                blank: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"balance">;
                left: z.ZodString;
                right: z.ZodString;
                tilt: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    level: "level";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"writing">;
                style: z.ZodEnum<{
                    tianzige: "tianzige";
                    fourline: "fourline";
                }>;
                count: z.ZodOptional<z.ZodNumber>;
                example: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sketch">;
                height: z.ZodNumber;
                elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    draw: z.ZodLiteral<"line">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"polyline">;
                    points: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                    closed: z.ZodOptional<z.ZodEnum<{
                        yes: "yes";
                        no: "no";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"rect">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"circle">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    radius: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"text">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    label: z.ZodString;
                    align: z.ZodOptional<z.ZodEnum<{
                        center: "center";
                        left: "left";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"arrow">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "draw">>;
            }, z.core.$strict>], "kind">>;
            phase: z.ZodOptional<z.ZodEnum<{
                demo: "demo";
                try: "try";
                vary: "vary";
                guide: "guide";
            }>>;
            variant: z.ZodOptional<z.ZodEnum<{
                numeric: "numeric";
                context: "context";
                reasoning: "reasoning";
            }>>;
            space: z.ZodOptional<z.ZodEnum<{
                line: "line";
                none: "none";
                lines: "lines";
                box: "box";
            }>>;
        }, z.core.$strict>>;
        responses: z.ZodArray<z.ZodObject<{
            id: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>;
            questionId: z.ZodString;
            rawResponse: z.ZodString;
            response: z.ZodOptional<z.ZodString>;
            legacyRecord: z.ZodOptional<z.ZodJSONSchema>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            assistanceConfirmation: z.ZodOptional<z.ZodString>;
            answerDateConfirmation: z.ZodOptional<z.ZodString>;
            answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"day">;
                day: z.ZodString;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"instant">;
                at: z.ZodNumber;
                basis: z.ZodEnum<{
                    "native-input": "native-input";
                    "current-manual": "current-manual";
                }>;
                sourceVersion: z.ZodString;
            }, z.core.$strict>], "kind">>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"openmaic">;
                bindingId: z.ZodString;
                attemptId: z.ZodString;
                sceneId: z.ZodString;
                questionId: z.ZodString;
                submission: z.ZodObject<{
                    id: z.ZodString;
                    seq: z.ZodNumber;
                    createdAt: z.ZodString;
                }, z.core.$strict>;
                submittedAnswer: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"native">;
                sessionId: z.ZodString;
                messageId: z.ZodString;
                inputVersion: z.ZodString;
                receiptAt: z.ZodOptional<z.ZodNumber>;
                attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"paper">;
                imagePaths: z.ZodArray<z.ZodString>;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"manual">;
                entry: z.ZodEnum<{
                    current: "current";
                    historical: "historical";
                }>;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"legacy">;
                sourcePath: z.ZodString;
                row: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        currentResponseId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>>;
        rounds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodEnum<{
                check: "check";
                review: "review";
            }>;
            startedAt: z.ZodNumber;
            members: z.ZodArray<z.ZodObject<{
                goalId: z.ZodString;
                familyId: z.ZodString;
                scope: z.ZodObject<{
                    id: z.ZodString;
                    description: z.ZodString;
                    modality: z.ZodEnum<{
                        written: "written";
                        oral: "oral";
                        listening: "listening";
                        audiovisual: "audiovisual";
                        performed: "performed";
                    }>;
                    numberMax: z.ZodOptional<z.ZodNumber>;
                    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
                mistakeId: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            enteredFamilyIds: z.ZodArray<z.ZodString>;
            familyEntries: z.ZodOptional<z.ZodArray<z.ZodObject<{
                familyId: z.ZodString;
                at: z.ZodNumber;
            }, z.core.$strict>>>;
            presentedQuestionIds: z.ZodArray<z.ZodString>;
            endedAt: z.ZodOptional<z.ZodNumber>;
            endReason: z.ZodOptional<z.ZodEnum<{
                complete: "complete";
                "budget-exhausted": "budget-exhausted";
                stopped: "stopped";
            }>>;
            moreReview: z.ZodOptional<z.ZodObject<{
                afterRoundId: z.ZodString;
                request: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        answerReveals: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            at: z.ZodNumber;
        }, z.core.$strict>>>;
        hints: z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            responseId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>>;
            level: z.ZodNumber;
            at: z.ZodNumber;
        }, z.core.$strict>>;
        stuckSignals: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            at: z.ZodNumber;
        }, z.core.$strict>>>;
        assessments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            responseId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>;
            result: z.ZodEnum<{
                correct: "correct";
                partial: "partial";
                incorrect: "incorrect";
                unassessed: "unassessed";
                stuck: "stuck";
            }>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            feedback: z.ZodString;
            answerEvidence: z.ZodString;
            assessedAt: z.ZodNumber;
            correctedAt: z.ZodOptional<z.ZodNumber>;
            criteria: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                method: "method";
                basic: "basic";
                variation: "variation";
            }>>>;
            criterionCorrection: z.ZodOptional<z.ZodObject<{
                sessionId: z.ZodString;
                messageId: z.ZodString;
                inputVersion: z.ZodString;
                rawResponse: z.ZodString;
            }, z.core.$strict>>;
            userConfirmation: z.ZodOptional<z.ZodString>;
            errorType: z.ZodOptional<z.ZodEnum<{
                pattern: "pattern";
                listening: "listening";
                "place-value": "place-value";
                "carry-borrow": "carry-borrow";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>;
            official: z.ZodOptional<z.ZodObject<{
                recordId: z.ZodString;
                seq: z.ZodNumber;
                createdAt: z.ZodString;
                result: z.ZodNullable<z.ZodObject<{
                    questionId: z.ZodString;
                    correct: z.ZodNullable<z.ZodBoolean>;
                    status: z.ZodEnum<{
                        correct: "correct";
                        incorrect: "incorrect";
                    }>;
                    earned: z.ZodNumber;
                    aiComment: z.ZodOptional<z.ZodString>;
                }, z.core.$catchall<z.ZodType<import("../types.ts").StudentJsonValue, unknown, z.core.$ZodTypeInternals<import("../types.ts").StudentJsonValue, unknown>>>>>;
            }, z.core.$strict>>;
            officialHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
                recordId: z.ZodString;
                seq: z.ZodNumber;
                createdAt: z.ZodString;
                result: z.ZodNullable<z.ZodObject<{
                    questionId: z.ZodString;
                    correct: z.ZodNullable<z.ZodBoolean>;
                    status: z.ZodEnum<{
                        correct: "correct";
                        incorrect: "incorrect";
                    }>;
                    earned: z.ZodNumber;
                    aiComment: z.ZodOptional<z.ZodString>;
                }, z.core.$catchall<z.ZodType<import("../types.ts").StudentJsonValue, unknown, z.core.$ZodTypeInternals<import("../types.ts").StudentJsonValue, unknown>>>>>;
            }, z.core.$strict>>>;
            grading: z.ZodOptional<z.ZodEnum<{
                pending: "pending";
                aligned: "aligned";
                equivalent: "equivalent";
                conflict: "conflict";
            }>>;
        }, z.core.$strict>>;
        pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourcePath: z.ZodString;
            row: z.ZodString;
            fields: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        pendingOpenmaic: z.ZodOptional<z.ZodArray<z.ZodObject<{
            binding: z.ZodObject<{
                bindingId: z.ZodString;
                learnerId: z.ZodString;
                termId: z.ZodString;
                blockId: z.ZodString;
                goalId: z.ZodString;
                familyId: z.ZodString;
                scope: z.ZodObject<{
                    id: z.ZodString;
                    description: z.ZodString;
                    modality: z.ZodEnum<{
                        written: "written";
                        oral: "oral";
                        listening: "listening";
                        audiovisual: "audiovisual";
                        performed: "performed";
                    }>;
                    numberMax: z.ZodOptional<z.ZodNumber>;
                    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
            }, z.core.$strict>;
            record: z.ZodObject<{
                id: z.ZodString;
                sessionId: z.ZodString;
                seq: z.ZodNumber;
                createdAt: z.ZodString;
                sceneId: z.ZodOptional<z.ZodString>;
                payload: z.ZodObject<{
                    payloadVersion: z.ZodLiteral<1>;
                    phase: z.ZodEnum<{
                        draft: "draft";
                        submitted: "submitted";
                        reviewed: "reviewed";
                    }>;
                    answers: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
                    results: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        questionId: z.ZodString;
                        correct: z.ZodNullable<z.ZodBoolean>;
                        status: z.ZodEnum<{
                            correct: "correct";
                            incorrect: "incorrect";
                        }>;
                        earned: z.ZodNumber;
                        aiComment: z.ZodOptional<z.ZodString>;
                    }, z.core.$catchall<z.ZodType<import("../types.ts").StudentJsonValue, unknown, z.core.$ZodTypeInternals<import("../types.ts").StudentJsonValue, unknown>>>>>>;
                }, z.core.$catchall<z.ZodJSONSchema>>;
            }, z.core.$catchall<z.ZodJSONSchema>>;
            reason: z.ZodEnum<{
                "missing-submission": "missing-submission";
                "conflicting-submissions": "conflicting-submissions";
                "ambiguous-session": "ambiguous-session";
                "unresolved-question": "unresolved-question";
            }>;
        }, z.core.$strict>>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").TermId, string>>;
        learnerId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").LearnerId, string>>>;
    }, z.core.$strict>;
    worksheet: z.ZodObject<{
        kind: z.ZodLiteral<"worksheet">;
        id: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").WorksheetId, string>>;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        worksheetKind: z.ZodOptional<z.ZodEnum<{
            review: "review";
            daily: "daily";
            practice: "practice";
        }>>;
        origin: z.ZodEnum<{
            prepared: "prepared";
            workbook: "workbook";
        }>;
        createdAt: z.ZodNumber;
        discardedAt: z.ZodOptional<z.ZodNumber>;
        archivedAt: z.ZodOptional<z.ZodNumber>;
        context: z.ZodObject<{
            profile: z.ZodOptional<z.ZodObject<{
                region: z.ZodString;
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                schoolYear: z.ZodString;
                schoolSystem: z.ZodEnum<{
                    "five-four": "five-four";
                    "six-three": "six-three";
                }>;
                nickname: z.ZodString;
                schoolAlias: z.ZodString;
                parentConfirmation: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>;
            pendingProfile: z.ZodOptional<z.ZodString>;
            scope: z.ZodOptional<z.ZodObject<{
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                units: z.ZodOptional<z.ZodArray<z.ZodString>>;
                objectiveIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"unknown">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"day">;
            day: z.ZodString;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"instant">;
            at: z.ZodNumber;
            basis: z.ZodEnum<{
                "native-input": "native-input";
                "current-manual": "current-manual";
            }>;
            sourceVersion: z.ZodString;
        }, z.core.$strict>], "kind">>;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            objectiveId: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                kind: z.ZodLiteral<"pending">;
                reason: z.ZodString;
            }, z.core.$strict>]>;
            capability: z.ZodOptional<z.ZodObject<{
                goalId: z.ZodString;
                familyId: z.ZodString;
                scope: z.ZodObject<{
                    id: z.ZodString;
                    description: z.ZodString;
                    modality: z.ZodEnum<{
                        written: "written";
                        oral: "oral";
                        listening: "listening";
                        audiovisual: "audiovisual";
                        performed: "performed";
                    }>;
                    numberMax: z.ZodOptional<z.ZodNumber>;
                    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            mistakeId: z.ZodOptional<z.ZodString>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"authored">;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"exercise">;
                exerciseId: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"mistake">;
                mistakeId: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"legacy">;
                sourcePath: z.ZodString;
                row: z.ZodString;
            }, z.core.$strict>], "kind">;
            topic: z.ZodString;
            prompt: z.ZodString;
            answer: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
            openmaic: z.ZodOptional<z.ZodObject<{
                bindingId: z.ZodString;
                sceneId: z.ZodString;
                questionId: z.ZodString;
                snapshot: z.ZodJSONSchema;
                snapshotHash: z.ZodString;
                revision: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"manifest">;
                    stageRev: z.ZodNumber;
                    sceneRev: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"unavailable">;
                }, z.core.$strict>], "kind">;
            }, z.core.$strict>>;
            basisStatus: z.ZodOptional<z.ZodLiteral<"legacy-pending">>;
            legacyRecord: z.ZodOptional<z.ZodJSONSchema>;
            choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
            steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
            figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"bar-model">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    segments: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        units: z.ZodNumber;
                        style: z.ZodOptional<z.ZodEnum<{
                            solid: "solid";
                            dashed: "dashed";
                        }>>;
                    }, z.core.$strict>>;
                    total: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"money">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>, z.ZodObject<{
                    denomination: z.ZodEnum<{
                        "1\u5206": "1分";
                        "2\u5206": "2分";
                        "5\u5206": "5分";
                        "1\u89D2": "1角";
                        "2\u89D2": "2角";
                        "5\u89D2": "5角";
                        "1\u5143": "1元";
                        "5\u5143": "5元";
                        "10\u5143": "10元";
                        "20\u5143": "20元";
                        "50\u5143": "50元";
                        "100\u5143": "100元";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>]>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"place-value">;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
                crossTens: z.ZodNumber;
                crossOnes: z.ZodNumber;
                regroup: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"hundred-chart">;
                hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                window: z.ZodOptional<z.ZodObject<{
                    center: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"number-line">;
                from: z.ZodNumber;
                to: z.ZodNumber;
                step: z.ZodNumber;
                marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    value: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    from: z.ZodNumber;
                    to: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"clock">;
                clocks: z.ZodArray<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sticks">;
                bundles: z.ZodNumber;
                singles: z.ZodNumber;
                crossBundles: z.ZodOptional<z.ZodNumber>;
                crossSingles: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"vertical">;
                count: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"shapes">;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                    }>;
                    count: z.ZodNumber;
                    blank: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"overlap">;
                left: z.ZodString;
                right: z.ZodString;
                leftOnly: z.ZodString;
                both: z.ZodString;
                rightOnly: z.ZodString;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"split">;
                parts: z.ZodArray<z.ZodObject<{
                    top: z.ZodString;
                    left: z.ZodString;
                    right: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sequence">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        star: "star";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                blank: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"wall">;
                rows: z.ZodArray<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"grid">;
                columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodOptional<z.ZodString>;
                    cells: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"dot-array">;
                rows: z.ZodNumber;
                columns: z.ZodNumber;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"plane">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        rectangle: "rectangle";
                        quadrilateral: "quadrilateral";
                        curved: "curved";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"solid">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        cube: "cube";
                        cuboid: "cuboid";
                        cylinder: "cylinder";
                        sphere: "sphere";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"counter">;
                hundreds: z.ZodNumber;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"measure">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    length: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        curved: "curved";
                        straight: "straight";
                    }>>;
                }, z.core.$strict>>;
                ruler: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"compass">;
                blank: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"balance">;
                left: z.ZodString;
                right: z.ZodString;
                tilt: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    level: "level";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"writing">;
                style: z.ZodEnum<{
                    tianzige: "tianzige";
                    fourline: "fourline";
                }>;
                count: z.ZodOptional<z.ZodNumber>;
                example: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sketch">;
                height: z.ZodNumber;
                elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    draw: z.ZodLiteral<"line">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"polyline">;
                    points: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                    closed: z.ZodOptional<z.ZodEnum<{
                        yes: "yes";
                        no: "no";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"rect">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"circle">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    radius: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"text">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    label: z.ZodString;
                    align: z.ZodOptional<z.ZodEnum<{
                        center: "center";
                        left: "left";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"arrow">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "draw">>;
            }, z.core.$strict>], "kind">>;
            phase: z.ZodOptional<z.ZodEnum<{
                demo: "demo";
                try: "try";
                vary: "vary";
                guide: "guide";
            }>>;
            variant: z.ZodOptional<z.ZodEnum<{
                numeric: "numeric";
                context: "context";
                reasoning: "reasoning";
            }>>;
            space: z.ZodOptional<z.ZodEnum<{
                line: "line";
                none: "none";
                lines: "lines";
                box: "box";
            }>>;
        }, z.core.$strict>>;
        responses: z.ZodArray<z.ZodObject<{
            id: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>;
            questionId: z.ZodString;
            rawResponse: z.ZodString;
            response: z.ZodOptional<z.ZodString>;
            legacyRecord: z.ZodOptional<z.ZodJSONSchema>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            assistanceConfirmation: z.ZodOptional<z.ZodString>;
            answerDateConfirmation: z.ZodOptional<z.ZodString>;
            answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"day">;
                day: z.ZodString;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"instant">;
                at: z.ZodNumber;
                basis: z.ZodEnum<{
                    "native-input": "native-input";
                    "current-manual": "current-manual";
                }>;
                sourceVersion: z.ZodString;
            }, z.core.$strict>], "kind">>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"openmaic">;
                bindingId: z.ZodString;
                attemptId: z.ZodString;
                sceneId: z.ZodString;
                questionId: z.ZodString;
                submission: z.ZodObject<{
                    id: z.ZodString;
                    seq: z.ZodNumber;
                    createdAt: z.ZodString;
                }, z.core.$strict>;
                submittedAnswer: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"native">;
                sessionId: z.ZodString;
                messageId: z.ZodString;
                inputVersion: z.ZodString;
                receiptAt: z.ZodOptional<z.ZodNumber>;
                attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"paper">;
                imagePaths: z.ZodArray<z.ZodString>;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"manual">;
                entry: z.ZodEnum<{
                    current: "current";
                    historical: "historical";
                }>;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"legacy">;
                sourcePath: z.ZodString;
                row: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        assessments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            responseId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>;
            result: z.ZodEnum<{
                correct: "correct";
                partial: "partial";
                incorrect: "incorrect";
                unassessed: "unassessed";
                stuck: "stuck";
            }>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            feedback: z.ZodString;
            answerEvidence: z.ZodString;
            assessedAt: z.ZodNumber;
            correctedAt: z.ZodOptional<z.ZodNumber>;
            criteria: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                method: "method";
                basic: "basic";
                variation: "variation";
            }>>>;
            criterionCorrection: z.ZodOptional<z.ZodObject<{
                sessionId: z.ZodString;
                messageId: z.ZodString;
                inputVersion: z.ZodString;
                rawResponse: z.ZodString;
            }, z.core.$strict>>;
            userConfirmation: z.ZodOptional<z.ZodString>;
            errorType: z.ZodOptional<z.ZodEnum<{
                pattern: "pattern";
                listening: "listening";
                "place-value": "place-value";
                "carry-borrow": "carry-borrow";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>;
            official: z.ZodOptional<z.ZodObject<{
                recordId: z.ZodString;
                seq: z.ZodNumber;
                createdAt: z.ZodString;
                result: z.ZodNullable<z.ZodObject<{
                    questionId: z.ZodString;
                    correct: z.ZodNullable<z.ZodBoolean>;
                    status: z.ZodEnum<{
                        correct: "correct";
                        incorrect: "incorrect";
                    }>;
                    earned: z.ZodNumber;
                    aiComment: z.ZodOptional<z.ZodString>;
                }, z.core.$catchall<z.ZodType<import("../types.ts").StudentJsonValue, unknown, z.core.$ZodTypeInternals<import("../types.ts").StudentJsonValue, unknown>>>>>;
            }, z.core.$strict>>;
            officialHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
                recordId: z.ZodString;
                seq: z.ZodNumber;
                createdAt: z.ZodString;
                result: z.ZodNullable<z.ZodObject<{
                    questionId: z.ZodString;
                    correct: z.ZodNullable<z.ZodBoolean>;
                    status: z.ZodEnum<{
                        correct: "correct";
                        incorrect: "incorrect";
                    }>;
                    earned: z.ZodNumber;
                    aiComment: z.ZodOptional<z.ZodString>;
                }, z.core.$catchall<z.ZodType<import("../types.ts").StudentJsonValue, unknown, z.core.$ZodTypeInternals<import("../types.ts").StudentJsonValue, unknown>>>>>;
            }, z.core.$strict>>>;
            grading: z.ZodOptional<z.ZodEnum<{
                pending: "pending";
                aligned: "aligned";
                equivalent: "equivalent";
                conflict: "conflict";
            }>>;
        }, z.core.$strict>>;
        drafts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            questionId: z.ZodString;
            response: z.ZodString;
            result: z.ZodEnum<{
                correct: "correct";
                partial: "partial";
                incorrect: "incorrect";
                unassessed: "unassessed";
                stuck: "stuck";
            }>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            confidence: z.ZodEnum<{
                high: "high";
                low: "low";
            }>;
            uncertainties: z.ZodString;
            imagePaths: z.ZodArray<z.ZodString>;
            receivedAt: z.ZodNumber;
        }, z.core.$strict>>;
        pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourcePath: z.ZodString;
            row: z.ZodString;
            fields: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").TermId, string>>;
        learnerId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").LearnerId, string>>>;
    }, z.core.$strict>;
    collections: z.ZodObject<{
        kind: z.ZodLiteral<"collections">;
        knowledge: z.ZodOptional<z.ZodObject<{
            goals: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                subject: z.ZodEnum<{
                    chinese: "chinese";
                    math: "math";
                    english: "english";
                }>;
                domain: z.ZodString;
                title: z.ZodString;
                scope: z.ZodString;
                criterion: z.ZodString;
                prerequisites: z.ZodArray<z.ZodString>;
                familyIds: z.ZodArray<z.ZodString>;
                sourceIds: z.ZodArray<z.ZodString>;
                curriculumAssociationIds: z.ZodArray<z.ZodString>;
                titleEn: z.ZodOptional<z.ZodString>;
                criterionEn: z.ZodOptional<z.ZodString>;
                curriculumAssociationGap: z.ZodOptional<z.ZodString>;
                coverageStatus: z.ZodOptional<z.ZodString>;
                activation: z.ZodOptional<z.ZodString>;
                evidenceRequirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
                progressKind: z.ZodOptional<z.ZodString>;
                prerequisitePolicy: z.ZodOptional<z.ZodString>;
                requirementIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                sourceLocators: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    sourceId: z.ZodString;
                    pdfPages: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                    section: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
            families: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                subject: z.ZodEnum<{
                    chinese: "chinese";
                    math: "math";
                    english: "english";
                }>;
                coreMethod: z.ZodString;
                structure: z.ZodString;
                goalIds: z.ZodArray<z.ZodString>;
                variationAxes: z.ZodArray<z.ZodString>;
                boundary: z.ZodString;
                representative: z.ZodObject<{
                    id: z.ZodString;
                    prompt: z.ZodString;
                    rubric: z.ZodString;
                    stimulus: z.ZodOptional<z.ZodJSONSchema>;
                }, z.core.$strict>;
                signature: z.ZodObject<{
                    capabilityIds: z.ZodArray<z.ZodString>;
                    coreMethod: z.ZodString;
                    problemStructure: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        legacyHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourcePath: z.ZodString;
            row: z.ZodString;
            record: z.ZodJSONSchema;
        }, z.core.$strict>>>;
        legacyReferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                exercise: "exercise";
                objective: "objective";
            }>;
            oldId: z.ZodString;
            status: z.ZodEnum<{
                pending: "pending";
                "review-required": "review-required";
            }>;
            candidateGoalIds: z.ZodArray<z.ZodString>;
            routes: z.ZodArray<z.ZodObject<{
                goalId: z.ZodString;
                familyId: z.ZodString;
            }, z.core.$strict>>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        mistakes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            explanation: z.ZodString;
            source: z.ZodOptional<z.ZodObject<{
                worksheetId: z.ZodString;
                itemId: z.ZodString;
            }, z.core.$strict>>;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            objectiveId: z.ZodOptional<z.ZodString>;
            materialId: z.ZodOptional<z.ZodString>;
            confirmedAt: z.ZodOptional<z.ZodNumber>;
            topic: z.ZodString;
            prompt: z.ZodString;
            answerEvidence: z.ZodString;
            learnerAnswer: z.ZodString;
            correction: z.ZodString;
            imagePath: z.ZodOptional<z.ZodString>;
            uncertainties: z.ZodString;
            errorType: z.ZodOptional<z.ZodEnum<{
                pattern: "pattern";
                listening: "listening";
                "place-value": "place-value";
                "carry-borrow": "carry-borrow";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>;
            userConfirmation: z.ZodOptional<z.ZodString>;
            capability: z.ZodOptional<z.ZodObject<{
                goalId: z.ZodString;
                familyId: z.ZodString;
                scope: z.ZodObject<{
                    id: z.ZodString;
                    description: z.ZodString;
                    modality: z.ZodEnum<{
                        written: "written";
                        oral: "oral";
                        listening: "listening";
                        audiovisual: "audiovisual";
                        performed: "performed";
                    }>;
                    numberMax: z.ZodOptional<z.ZodNumber>;
                    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        exercises: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            objectiveId: z.ZodString;
            role: z.ZodEnum<{
                diagnose: "diagnose";
                demo: "demo";
                try: "try";
                vary: "vary";
                daily: "daily";
            }>;
            variant: z.ZodEnum<{
                numeric: "numeric";
                context: "context";
                reasoning: "reasoning";
            }>;
            prompt: z.ZodString;
            choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
            figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"bar-model">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    segments: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        units: z.ZodNumber;
                        style: z.ZodOptional<z.ZodEnum<{
                            solid: "solid";
                            dashed: "dashed";
                        }>>;
                    }, z.core.$strict>>;
                    total: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"money">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>, z.ZodObject<{
                    denomination: z.ZodEnum<{
                        "1\u5206": "1分";
                        "2\u5206": "2分";
                        "5\u5206": "5分";
                        "1\u89D2": "1角";
                        "2\u89D2": "2角";
                        "5\u89D2": "5角";
                        "1\u5143": "1元";
                        "5\u5143": "5元";
                        "10\u5143": "10元";
                        "20\u5143": "20元";
                        "50\u5143": "50元";
                        "100\u5143": "100元";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>]>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"place-value">;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
                crossTens: z.ZodNumber;
                crossOnes: z.ZodNumber;
                regroup: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"hundred-chart">;
                hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                window: z.ZodOptional<z.ZodObject<{
                    center: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"number-line">;
                from: z.ZodNumber;
                to: z.ZodNumber;
                step: z.ZodNumber;
                marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    value: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    from: z.ZodNumber;
                    to: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"clock">;
                clocks: z.ZodArray<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sticks">;
                bundles: z.ZodNumber;
                singles: z.ZodNumber;
                crossBundles: z.ZodOptional<z.ZodNumber>;
                crossSingles: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"vertical">;
                count: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"shapes">;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                    }>;
                    count: z.ZodNumber;
                    blank: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"overlap">;
                left: z.ZodString;
                right: z.ZodString;
                leftOnly: z.ZodString;
                both: z.ZodString;
                rightOnly: z.ZodString;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"split">;
                parts: z.ZodArray<z.ZodObject<{
                    top: z.ZodString;
                    left: z.ZodString;
                    right: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sequence">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        star: "star";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                blank: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"wall">;
                rows: z.ZodArray<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"grid">;
                columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodOptional<z.ZodString>;
                    cells: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"dot-array">;
                rows: z.ZodNumber;
                columns: z.ZodNumber;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"plane">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        rectangle: "rectangle";
                        quadrilateral: "quadrilateral";
                        curved: "curved";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"solid">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        cube: "cube";
                        cuboid: "cuboid";
                        cylinder: "cylinder";
                        sphere: "sphere";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"counter">;
                hundreds: z.ZodNumber;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"measure">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    length: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        curved: "curved";
                        straight: "straight";
                    }>>;
                }, z.core.$strict>>;
                ruler: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"compass">;
                blank: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"balance">;
                left: z.ZodString;
                right: z.ZodString;
                tilt: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    level: "level";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"writing">;
                style: z.ZodEnum<{
                    tianzige: "tianzige";
                    fourline: "fourline";
                }>;
                count: z.ZodOptional<z.ZodNumber>;
                example: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sketch">;
                height: z.ZodNumber;
                elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    draw: z.ZodLiteral<"line">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"polyline">;
                    points: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                    closed: z.ZodOptional<z.ZodEnum<{
                        yes: "yes";
                        no: "no";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"rect">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"circle">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    radius: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"text">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    label: z.ZodString;
                    align: z.ZodOptional<z.ZodEnum<{
                        center: "center";
                        left: "left";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"arrow">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "draw">>;
            }, z.core.$strict>], "kind">>;
            steps: z.ZodArray<z.ZodString>;
            answer: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
            errorType: z.ZodOptional<z.ZodEnum<{
                pattern: "pattern";
                listening: "listening";
                "place-value": "place-value";
                "carry-borrow": "carry-borrow";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>;
            savedAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>>>;
        concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            name: z.ZodString;
            definition: z.ZodString;
            example: z.ZodString;
            source: z.ZodString;
            facts: z.ZodOptional<z.ZodArray<z.ZodString>>;
            misconceptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
            confirmedAt: z.ZodOptional<z.ZodNumber>;
            userConfirmation: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        objectives: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            title: z.ZodString;
            goal: z.ZodString;
            conceptIds: z.ZodArray<z.ZodString>;
            method: z.ZodEnum<{
                context: "context";
                recognize: "recognize";
                "read-evidence": "read-evidence";
                express: "express";
                represent: "represent";
                reason: "reason";
                verify: "verify";
                listen: "listen";
                speak: "speak";
            }>;
            errorTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                pattern: "pattern";
                listening: "listening";
                "place-value": "place-value";
                "carry-borrow": "carry-borrow";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>>;
            questionPoints: z.ZodOptional<z.ZodArray<z.ZodString>>;
            variationAxes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                context: "context";
                numbers: "numbers";
                representation: "representation";
                reverse: "reverse";
                explain: "explain";
            }>>>;
        }, z.core.$strict>>>;
        relations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            fromId: z.ZodString;
            toId: z.ZodString;
            kind: z.ZodEnum<{
                prerequisite: "prerequisite";
                "part-of": "part-of";
                contrast: "contrast";
                explains: "explains";
                "cause-effect": "cause-effect";
            }>;
            explanation: z.ZodString;
            source: z.ZodString;
        }, z.core.$strict>>>;
        teachingQueue: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            prompt: z.ZodString;
            objectiveId: z.ZodOptional<z.ZodString>;
            confirmedAt: z.ZodNumber;
            sourceDraftId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        rewards: z.ZodArray<z.ZodObject<{
            reason: z.ZodEnum<{
                reflection: "reflection";
                participation: "participation";
            }>;
            day: z.ZodString;
        }, z.core.$strict>>;
        pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourcePath: z.ZodString;
            row: z.ZodString;
            fields: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").TermId, string>>;
        learnerId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").LearnerId, string>>>;
    }, z.core.$strict>;
    'daily-plan': z.ZodObject<{
        kind: z.ZodLiteral<"daily-plan">;
        learnerId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").LearnerId, string>>;
        id: z.ZodString;
        day: z.ZodString;
        timezone: z.ZodLiteral<"Asia/Shanghai">;
        revision: z.ZodNumber;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        policyVersion: z.ZodLiteral<1>;
        settingsVersion: z.ZodString;
        subjects: z.ZodArray<z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>>;
        state: z.ZodEnum<{
            ready: "ready";
            paused: "paused";
            stopped: "stopped";
            active: "active";
            completed: "completed";
        }>;
        completedAt: z.ZodOptional<z.ZodNumber>;
        tasks: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            purpose: z.ZodEnum<{
                teaching: "teaching";
                learning: "learning";
                review: "review";
                resume: "resume";
                diagnostic: "diagnostic";
            }>;
            goalId: z.ZodOptional<z.ZodString>;
            scope: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                modality: z.ZodEnum<{
                    written: "written";
                    oral: "oral";
                    listening: "listening";
                    audiovisual: "audiovisual";
                    performed: "performed";
                }>;
                numberMax: z.ZodOptional<z.ZodNumber>;
                vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>;
            familyIds: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
            basis: z.ZodArray<z.ZodObject<{
                termId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").TermId, string>>;
                ownerKind: z.ZodEnum<{
                    block: "block";
                    worksheet: "worksheet";
                }>;
                ownerId: z.ZodString;
                responseId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>;
            }, z.core.$strict>>;
            ending: z.ZodEnum<{
                "short-check": "short-check";
                "review-attempts": "review-attempts";
                "original-activity": "original-activity";
            }>;
            state: z.ZodEnum<{
                ready: "ready";
                paused: "paused";
                active: "active";
                completed: "completed";
                deferred: "deferred";
                skipped: "skipped";
                "carried-forward": "carried-forward";
            }>;
            activity: z.ZodOptional<z.ZodObject<{
                blockId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").BlockId, string>>;
                roundId: z.ZodOptional<z.ZodString>;
                questionId: z.ZodOptional<z.ZodString>;
                responseId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>>;
            }, z.core.$strict>>;
            original: z.ZodOptional<z.ZodObject<{
                day: z.ZodString;
                taskId: z.ZodString;
            }, z.core.$strict>>;
            carriedTo: z.ZodOptional<z.ZodObject<{
                day: z.ZodString;
                taskId: z.ZodString;
            }, z.core.$strict>>;
            optional: z.ZodOptional<z.ZodBoolean>;
            outcomes: z.ZodArray<z.ZodObject<{
                termId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").TermId, string>>;
                ownerKind: z.ZodEnum<{
                    block: "block";
                    worksheet: "worksheet";
                }>;
                ownerId: z.ZodString;
                responseId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").ResponseId, string>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        choices: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            at: z.ZodNumber;
            revision: z.ZodNumber;
            action: z.ZodEnum<{
                start: "start";
                continue: "continue";
                pause: "pause";
                stop: "stop";
                defer: "defer";
                skip: "skip";
                adjust: "adjust";
                carry: "carry";
                extra: "extra";
            }>;
            reason: z.ZodString;
            taskIds: z.ZodArray<z.ZodString>;
            replacedTaskIds: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<import("./schema.ts").TermId, string>>;
    }, z.core.$strict>;
};
/** Names accepted by the packaged schema and example commands. */
export type AuthoringKind = keyof typeof schemas;
/**
 * Generate the structural JSON schema without losing branded identifier input constraints.
 * @param kind - official file kind or the shared figure union.
 * @returns strict input JSON schema; relational rules require the read-only CLI.
 */
export declare function authoringSchema(kind: AuthoringKind): z.core.JSONSchema.BaseSchema;
/**
 * Generate schema-checked starting examples; these are examples, never learner evidence.
 * @param kind - resource to instantiate; figure returns every supported variant.
 * @returns examples checked by the same source definitions as official file readers.
 */
export declare function authoringExample(kind: AuthoringKind): unknown;
/**
 * Check a command resource selector against the installed schema catalog.
 * @param name - native shell command argument.
 * @returns the known selector or an actionable error.
 */
export declare function authoringKind(name: string | undefined): AuthoringKind;
export {};
//# sourceMappingURL=resources.d.ts.map
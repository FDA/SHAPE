import { isEmptyObject } from "./utils";

// questionnaire
export function FHIRQuestionnaire(formattedQuestions: any, q: any) {
   const {
      locked,
      archived,
      surveyId,
      open,
      shortDescription,
      description,
      dateCreated,
      name,
      id,
   } = q;

   return {
      resource: {
         resourceType: "Questionnaire",
         meta: {
            profile: [
               "http://ibm.com/fhir/fda/shape/StructureDefinition/ibm-fda-shape-questionnaire",
            ],
         },
         extension: [
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-lockedQuestionnaire",
               valueBoolean: !isEmptyObject(locked) ? locked : false,
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-archivedQuestionnaire",
               valueBoolean: archived, //${archived}
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentSurvey",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/SurveyIdentifier",
                  value: surveyId, //"${surveyId}"
               },
            },
         ],
         identifier: [
            {
               system: "http://ibm.com/fhir/fda/SHAPE/identifier",
               value: id,
            },
         ],
         item: formattedQuestions,
         title: shortDescription, //"${shortDescription}",
         date: dateCreated, //"${dateCreated}",
         description: description, //"${description}",
         name: name, //"${name}",
         status: open ? "active" : "closed", //"${open} ? active : closed"
      },
   };
}

// singleText
export function FHIRSingleText(q: any) {
   const {
      title,
      variable,
      requiredMessage,
      name,
      required,
      text,
      placeholder,
      rules,
   } = q;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: title.trim(), //"${title}"
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(), //"${variable}"
         },
      ],
      type: "string",
      linkId: name, //"${name}",
      required: !isEmptyObject(required) ? required : false, //${required},
      text: text, //"${text}",
   };

   if (!isEmptyObject(required) && !isEmptyObject(requiredMessage))
      question.extension.push({
         url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRequiredText",
         valueMarkdown: requiredMessage,
      });
   if (!isEmptyObject(rules)) {
      rules.forEach((rule: any) => {
         const formattedRule: any = {
            extension: [
               {
                  url: "ruleType",
                  valueCode: rule.ruleType,
               },
               {
                  url: "skipTo",
                  valueString: rule.skipTo.trim(),
               },
            ],
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRule",
         };

         rule.expression.entries.forEach((entry: any) => {
            formattedRule.extension.push({
               extension: [
                  {
                     url: "operator",
                     valueCode: entry.operator, // "${operator}"
                  },
                  {
                     url: "value",
                     valueString: entry.value.trim(), // "${value}"
                  },
                  {
                     url: "fact",
                     valueString: entry.fact.trim(), // "${fact}"
                  },
               ],
               url: "rule",
            });
         });
         question.extension.push(formattedRule);
      });
   }

   if (!isEmptyObject(placeholder)) {
      question.initial = [
         {
            valueString: placeholder.trim(), //"${placeholder}"
         },
      ];
   }

   return question;
}

// radioButton
export function FHIRRadio(q: any) {
   const { title, variable, requiredMessage, name, required, text, choices } =
      q;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: title.trim(), //"${title}"
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(), //"${variable}"
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
            valueCodeableConcept: {
               coding: [
                  {
                     code: "radio-button",
                     system: "http://hl7.org/fhir/questionnaire-item-control",
                  },
               ],
            },
         },
      ],
      answerOption: formatChoices(choices),
      type: "choice",
      linkId: name, //"${name}",
      required: !isEmptyObject(required) ? required : false, //${ required },
      text: text, //"${text}"
   };

   if (!isEmptyObject(required) && !isEmptyObject(requiredMessage))
      question.extension.push({
         url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRequiredText",
         valueMarkdown: requiredMessage,
      });

   return question;
}

// dateTime
export function FHIRDateTime(q: any) {
   const {
      title,
      variable,
      requiredMessage,
      name,
      required,
      text /*, format*/,
   } = q;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: title.trim(), //"${title}"
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(), //"${variable}"
         },
         /*{
                url: 'http://hl7.org/fhir/StructureDefinition/regex',
                valueString: format.trim() //"${regex}"
            }*/
      ],
      type: "date",
      text: text, //"${text}",
      linkId: name, //"${name}",
      required: !isEmptyObject(required) ? required : false, //${required}
   };
   if (!isEmptyObject(required) && !isEmptyObject(requiredMessage))
      question.extension.push({
         url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRequiredText",
         valueMarkdown: requiredMessage,
      });
   return question;
}

// checkbox
export function FHIRCheckbox(q: any) {
   const { title, variable, requiredMessage, name, required, text, choices } =
      q;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: title.trim(), //"${title}"
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(), //"${variable}"
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
            valueCodeableConcept: {
               coding: [
                  {
                     code: "check-box",
                     system: "http://hl7.org/fhir/questionnaire-item-control",
                  },
               ],
            },
         },
      ],
      answerOption: formatChoices(choices),
      type: "choice",
      linkId: name, //"${name}",
      required: !isEmptyObject(required) ? required : false, //${required},
      text: text, //"${text}"
   };
   if (!isEmptyObject(required) && !isEmptyObject(requiredMessage))
      question.extension.push({
         url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRequiredText",
         valueMarkdown: requiredMessage,
      });
   return question;
}

// dropdown
export function FHIRDropdown(q: any) {
   const { title, variable, requiredMessage, name, required, text, choices } =
      q;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: title.trim(), //"${title}"
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(), //"${variable}"
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
            valueCodeableConcept: {
               coding: [
                  {
                     code: "drop-down",
                     system: "http://hl7.org/fhir/questionnaire-item-control",
                  },
               ],
            },
         },
      ],
      answerOption: formatChoices(choices),
      type: "choice",
      linkId: name, //"${name}",
      required: !isEmptyObject(required) ? required : false, //${required},
      text: text, //"${text}"
   };
   if (!isEmptyObject(required) && !isEmptyObject(requiredMessage))
      question.extension.push({
         url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRequiredText",
         valueMarkdown: requiredMessage,
      });
   return question;
}

// slider
export function FHIRSlider(q: any) {
   const { title, variable, options, requiredMessage, name, required, text } =
      q;
   const { min, max, step, pin, ticks } = options;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: title.trim(), //"${title}"
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(), //"${variable}"
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
            valueCodeableConcept: {
               coding: [
                  {
                     code: "slider",
                     system: "http://hl7.org/fhir/questionnaire-item-control",
                  },
               ],
            },
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/minValue",
            valueInteger: parseInt(min), //${min}
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/maxValue",
            valueInteger: parseInt(max), //${max}
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue",
            valueInteger: parseInt(step), //${step}
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-sliderShowPin",
            valueBoolean: pin, //${pin}
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-sliderShowTicks",
            valueBoolean: ticks, //${ticks}
         },
      ],
      type: "integer",
      linkId: name, //"${name}",
      text: text, //"${text}",
      required: !isEmptyObject(required) ? required : false, //${required}
   };
   if (!isEmptyObject(required) && !isEmptyObject(requiredMessage))
      question.extension.push({
         url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRequiredText",
         valueMarkdown: requiredMessage,
      });
   return question;
}

// textarea
export function FHIRTextarea(q: any) {
   const {
      title,
      variable,
      requiredMessage,
      name,
      required,
      text,
      placeholder,
   } = q;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: title.trim(),
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(),
         },
      ],
      type: "text",
      linkId: name, //"${name}",
      required: !isEmptyObject(required) ? required : false, //${required},
      text: text, //"${text}",
   };
   if (!isEmptyObject(required) && !isEmptyObject(requiredMessage))
      question.extension.push({
         url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRequiredText",
         valueMarkdown: requiredMessage,
      });
   if (!isEmptyObject(placeholder)) {
      question.initial = [
         {
            valueString: placeholder.trim(), //"${placeholder}"
         },
      ];
   }
   return question;
}

// range
export function FHIRRange(q: any) {
   const { title, variable, requiredMessage, name, required, text, min, max } =
      q;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: title.trim(), //"${title}"
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(), //"${variable}"
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
            valueCodeableConcept: {
               coding: [
                  {
                     code: "text-box",
                     system: "http://hl7.org/fhir/questionnaire-item-control",
                  },
               ],
            },
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/minValue",
            valueInteger: parseInt(min), //${min}
         },
         {
            url: "http://hl7.org/fhir/StructureDefinition/maxValue",
            valueInteger: parseInt(max), //${max}
         },
      ],
      type: "integer",
      linkId: name, //"${name}",
      text: text, //"${text}",
      required: !isEmptyObject(required) ? required : false, //${required}
   };

   if (!isEmptyObject(required) && !isEmptyObject(requiredMessage))
      question.extension.push({
         url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemRequiredText",
         valueMarkdown: requiredMessage,
      });
   return question;
}

export function FHIRInfo(q: any) {
   const { variable, sections, name } = q;
   const question: any = {
      extension: [
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemSASVariableName",
            valueString: variable.trim(),
         },
         {
            url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-itemTitle",
            valueString: "info",
         },
      ],
      item: [],
      type: "group",
      required: false,
      linkId: name,
   };

   for (const section of sections) {
      switch(section.type) {
         case "header":
            question.item.push({
               extension: [
                  {
                     url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
                     valueCodeableConcept: {
                        coding: [
                           {
                              code: "header",
                              system:
                                 "http://hl7.org/fhir/questionnaire-item-control",
                           },
                        ],
                     },
                  },
               ],
               type: "display",
               text: section.value,
               linkId: section.id,
            });
            break;
         case "break":
            question.item.push({
               extension: [
                  {
                     url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
                     valueCodeableConcept: {
                        coding: [
                           {
                              code: "break",
                              system:
                                 "http://ibm.com/fhir/fda/shape/CodeSystem/questionnaire-item-control",
                           },
                        ],
                     },
                  },
               ],
               type: "display",
               linkId: section.id,
            });
            break;
         case "textarea":
            question.item.push({
               extension: [
                  {
                     url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
                     valueCodeableConcept: {
                        coding: [
                           {
                              code: "text",
                              system:
                                 "http://hl7.org/fhir/questionnaire-item-control",
                           },
                        ],
                     },
                  },
               ],
               type: "display",
               text: section.value,
               linkId: section.id,
            });
            break;
         case "list":
            const listItem = {
               extension: [
                  {
                     url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
                     valueCodeableConcept: {
                        coding: [
                           {
                              code: "list",
                              system:
                                 "http://hl7.org/fhir/questionnaire-item-control",
                           },
                        ],
                     },
                  },
               ],
               item: [],
               type: "group",
               linkId: section.id,
            };
   
            for (const choice of section.choices) {
               listItem.item.push({
                  extension: [
                     {
                        //@ts-ignore
                        url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
                        valueCodeableConcept: {
                           coding: [
                              {
                                 //@ts-ignore
                                 code: "text",
                                 //@ts-ignore
                                 system:
                                    "http://hl7.org/fhir/questionnaire-item-control",
                              },
                           ],
                        },
                     },
                  ],
                  //@ts-ignore
                  type: "display",
                  //@ts-ignore
                  text: choice.text,
                  //@ts-ignore
                  linkId: choice.index,
               });
            }
            question.item.push(listItem);
            break;
         case "table":
            const tableItem = {
               extension: [
                  {
                     url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
                     valueCodeableConcept: {
                        coding: [
                           {
                              code: "gtable",
                              system:
                                 "http://hl7.org/fhir/questionnaire-item-control",
                           },
                        ],
                     },
                  },
               ],
               item: [],
               type: "group",
               linkId: section.id,
            };
   
            for (let i = 0; i < section.rowCount; i++) {
               const row = {
                  item: [],
                  type: "group",
                  linkId: `${section.id}-row-${i}`,
               };
               const rowCells = section.cells.filter((cell: any) => {
                  return cell.row === i;
               });
               for (const cell of rowCells) {
                  row.item.push({
                     extension: [
                        {
                           //@ts-ignore
                           url: "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
                           valueCodeableConcept: {
                              coding: [
                                 {
                                    //@ts-ignore
                                    code: "text",
                                    //@ts-ignore
                                    system:
                                       "http://hl7.org/fhir/questionnaire-item-control",
                                 },
                              ],
                           },
                        },
                     ],
                     //@ts-ignore
                     type: "display",
                     //@ts-ignore
                     text: cell.value,
                     //@ts-ignore
                     linkId: `${section.id}-row-${cell.row}-col-${cell.col}`,
                  });
               }
               //@ts-ignore
               tableItem.item.push(row);
            }
   
            question.item.push(tableItem);
            break;
         case "image":
            question.item.push({
               type: "attachment",
               linkId: section.id,
               initial: [
                  {
                     valueAttachment: {
                        contentType: "image/jpg",
                        url: section.value,
                        title: section.fileName,
                     },
                  },
               ],
            });
            break;
         default:
            break;
      }
   }
   
   return question;
}

function formatChoices(choices: any) {
   const formattedChoices = [];
   for (const choice of choices) {
      const formattedChoice = {
         extension: [
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-answerValue",
               valueString: choice.value.trim(), //"${value}"
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-answerIdentifier",
               valueString: choice.index.trim(), //"${index}"
            },
         ],
         valueString: choice.text.trim(), //"${text}"
      };
      formattedChoices.push(formattedChoice);
   }

   return formattedChoices;
}

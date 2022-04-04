import React, { Component } from "react";
import {
  HeaderDisplayComponent,
  TextAreaDisplayComponent,
  ListDisplayComponent,
  TableDisplayComponent,
  ImageDisplayComponent,
} from "./InfoCardComponents";
import { IonCard, IonCardContent } from "@ionic/react";
import { isEmptyObject } from "../../../utils/Utils";
import { sectionTypes } from "../../../utils/Constants";
import {
  User,
  QuestionnaireQuestion,
  QuestionnaireInfoQuestion,
  InfoCardSection,
  InfoCardTextSection,
  InfoCardListSection,
  InfoCardTableSection,
  InfoCardImageSection,
} from "../../../interfaces/DataTypes";

interface PassedProps {
  question: QuestionnaireQuestion;
  profile: User;
  org: string;
}

class InfoCard extends Component<PassedProps, {}> {
  render() {
    let { question } = this.props;
    let { sections } = question as QuestionnaireInfoQuestion;
    return (
      <>
        <IonCard>
          <IonCardContent style={{ maxHeight: "99%", overflow: "scroll" }}>
            {isEmptyObject(sections) && <span>No Sections Added</span>}
            {sections.map((section: InfoCardSection, index: number) => {
              if (section.type === sectionTypes.BREAK) {
                return <br key={index} />;
              }
              if (section.type === sectionTypes.HEADER) {
                return (
                  <HeaderDisplayComponent
                    index={index}
                    section={section as InfoCardTextSection}
                    key={index}
                  />
                );
              }
              if (section.type === sectionTypes.TEXTAREA) {
                return (
                  <TextAreaDisplayComponent
                    index={index}
                    section={section as InfoCardTextSection}
                    key={index}
                  />
                );
              }
              if (section.type === sectionTypes.LIST) {
                return (
                  <ListDisplayComponent
                    section={section as InfoCardListSection}
                    key={index}
                  />
                );
              }
              if (section.type === sectionTypes.TABLE) {
                return (
                  <TableDisplayComponent
                    section={section as InfoCardTableSection}
                    key={index}
                  />
                );
              }

              if (section.type === sectionTypes.IMAGE) {
                return (
                  <ImageDisplayComponent
                    org={
                      !isEmptyObject(this.props.profile.org)
                        ? this.props.profile.org
                        : this.props.org
                    }
                    section={section as InfoCardImageSection}
                    key={index}
                  />
                );
              }
              return null;
            })}
          </IonCardContent>
        </IonCard>
      </>
    );
  }
}

export default InfoCard;

import React, { Component } from "react";
//@ts-ignore
import { FhirResource, fhirVersions } from "fhir-react";
import "fhir-react/build/style.css";
import "fhir-react/build/bootstrap-reboot.min.css";

interface PassedProps {
  data: any;
}

class EhrViewer extends Component<PassedProps, {}> {
  render() {
    const { data } = this.props;
    const { error } = data;
    let dataView = <p>No Result</p>;
    if (error) {
      dataView = (
        <p>
          An error has occured, please restart this process from the beginning.
        </p>
      );
    } else {
      if (data && data.resourceType) {
        dataView = (
          <FhirResource
            fhirResource={data}
            thorough={true}
            fhirVersion={fhirVersions.DSTU2}
          />
        );
      }
    }
    return <div>{dataView}</div>;
  }
}

export default EhrViewer;

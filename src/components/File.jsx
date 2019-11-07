import * as React from 'react';
import { FileUploader } from 'baseui/file-uploader';

export default class Uploader extends React.Component {
  state = { progressAmount: 0 };

  handleDrop = (acceptedFiles, rejectedFiles) => {
    const { contentCallback } = this.props;
    const textType = /text.*/;
    const file = acceptedFiles[0]
    // console.log(file);
    // console.log(file.type);

    if (!file.type || file.type.match(textType) || file.type.match(/geo/) 
    || file.type.match(/json/)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setState({ progressAmount: 100 });
        this.reset();
        const text = reader.result;
        typeof (contentCallback) === 'function' &&
          contentCallback({ text, name: file.name })
        // console.log(text)        
      }
      reader.readAsText(file);
    } else {
      this.setState({ progressAmount: 100 });
      this.reset();
      console.log("File not supported!")
    }
    // handle file upload...
    this.startProgress();
  };

  // startProgress method is only illustrative. Use the progress info returned
  // from your upload endpoint. If unavailable, do not provide a progressAmount.
  startProgress = () => {
    this.intervalId = setInterval(() => {
      if (this.state.progressAmount >= 100) {
        this.reset();
      } else {
        this.setState({ progressAmount: this.state.progressAmount + 10 });
      }
    }, 500);
  };

  // reset the component to its original state. use this to cancel/retry the upload.
  reset = () => {
    clearInterval(this.intervalId);
    this.setState({ progressAmount: 0 });
  };

  render() {
    return (
      <center className="file-upload">
        <FileUploader
          onCancel={this.reset}
          onDrop={this.handleDrop}
          progressAmount={this.state.progressAmount}
          progressMessage={
            this.state.progressAmount &&
            `Uploading... ${this.state.progressAmount}% of 100%`
          }
        />
      </center>
    );
  }
}
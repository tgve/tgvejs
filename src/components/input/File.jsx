import * as React from 'react';
import { FileUploader } from 'baseui/file-uploader';

export default class Uploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progressAmount: 0,
    }
    this.reset = this.reset.bind(this);
    this.handleDrop = this.handleDrop.bind(this)
    this.startProgress = this.startProgress.bind(this)
  }

  handleDrop(acceptedFiles, rejectedFiles) {
    const { contentCallback } = this.props;
    const textType = /text.*|json|geo/;
    const file = acceptedFiles[0]

    if (file.type.match(textType) || file.type.match(/zip/)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setState({ progressAmount: 100 });
        this.reset();

        typeof contentCallback === 'function'
        && contentCallback({
          textOrBuffer: reader.result,
          name: file.name,
          type: file.type
        })
      }
      if (file.type.match(textType)) reader.readAsText(file);
      if (file.type.match(/zip/)) reader.readAsArrayBuffer(file)
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
  startProgress() {
    this.intervalId = setInterval(() => {
      if (this.state.progressAmount >= 100) {
        this.reset();
      } else {
        this.setState({ progressAmount: this.state.progressAmount + 10 });
      }
    }, 500);
  };

  // reset the component to its original state. use this to cancel/retry the upload.
  reset() {
    clearInterval(this.intervalId);
    this.setState({ progressAmount: 0 });
  };

  render() {
    return (
      <center className="file-upload">
        <FileUploader
          multiple={false}
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

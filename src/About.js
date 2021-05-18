/**
 * L Hama
 */
import React, { Component } from 'react';
import marked from "marked";

/**
 * Separate the Header and the main content.
 * Up to this point we are still not using SSR
 */
class About extends Component {
  state = { markdown: null }
  componentDidMount() {
    const readmePath = "https://raw.githubusercontent.com/layik/eAtlas/master/README.md";

    fetch(readmePath)
      .then(response => {
        return response.text()
      })
      .then(text => {
        this.setState({
          markdown: marked(text)
        })
      })
  }
  render() {
    const { markdown } = this.state;

    return (
      <section style={{ background: 'white', padding: '5%' }}>
        <article dangerouslySetInnerHTML={{ __html: markdown }}></article>
      </section>
    )
  }
}

export default About;

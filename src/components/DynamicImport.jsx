import { Component } from 'react'
//https://tylermcginnis.com/react-router-code-splitting/
//we can further add our laoding spinner here.
export default class DynamicImport extends Component {
  state = {
    component: null
  }
  componentDidMount () {
    this.props.load()
      .then((component) => {
        this.setState(() => ({
          component: component.default ? component.default : component
        }))
      })
  }
  render() {
    return this.props.children(this.state.component)
  }
}
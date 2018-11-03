import React, { PureComponent } from 'react'
import debounce from 'debounce'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Box from '../components/Box/Box'
import Input from '../components/Input/Input'
import Dropper from '../components/Dropper/Dropper'

import SpaceCanvas from '../component-instances/SpaceCanvas'

const getAtomDropperResources = (resources) => {
  return resources
    .filter(r => r.type === 'atom')
    .map(r => {
      return {
        id: r.id,
        name: r.name
      }
    })
}

const getImageDropperResources = (resources) => {
  return [
    ...resources
      .filter(r => r.type === 'image')
      .map(r => {
        return {
          id: r.id,
          name: r.name
        }
      }),
    {
      id: 'none',
      name: '<None>'
    }
  ]
}

const getAtomToPlot = (resources) => {
  const foundAtom = resources.find(r => r.type === 'atom')
  if (foundAtom !== undefined) {
    return foundAtom.id
  }
  return 'none'
}

const StyledResource = styled.div`
  section.settings-plot-info {
    .component--box.settings {
      .coords {
        display: grid;
        grid-template-columns: 2fr 2fr;
        grid-gap: 1rem;
        margin-bottom: 2rem;
      }
      .component--dropper:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
    .component--box.plot {
      margin-top: 1rem;
      .component--heading2 + .component--dropper {
        margin-top: 1rem;
      }
    }
    .component--box.info {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: 2fr 2fr;
      grid-gap: 1rem;
    }
  }
  section.canvas {
    margin-top: 1rem;
    overflow: scroll;
    // background-color: red;
  }
  @media screen and (min-width: 960px) {
    section.settings-plot-info {
      float: left;
      width: 240px;
      .component--box.plot {
        margin-top: 2rem;
      }
      .component--box.info {
        margin-top: 2rem;
      }
    }
    section.canvas {
      margin-top: 0;
      margin-left: calc(240px + 2rem);
    }
  }
`

class ResourceSpace extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      resource: props.resource,
      touchCoords: {
        x: 0,
        y: 0
      },
      atomToPlot: getAtomToPlot(props.resources)
    }
    this.onUpdate = debounce((data) => {
      this.props.onUpdate(data)
    }, 500)
    this.onChooseBackgroundImage = this.onChooseBackgroundImage.bind(this)
    this.onChooseForegroundImage = this.onChooseForegroundImage.bind(this)
    this.onChooseAtomToPlot = this.onChooseAtomToPlot.bind(this)
    this.plotAtom = this.plotAtom.bind(this)
    this.updateTouchCoords = this.updateTouchCoords.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      resource: nextProps.resource
    })
  }

  onChangeMasterProp(prop, v) {
    this.onUpdate({
      [prop]: parseInt(v, 10)
    })
  }

  onChangeCameraProp(prop, v) {
    this.onUpdate({
      camera: {
        ...this.state.resource.camera,
        [prop]: parseInt(v, 10)
      }
    })
  }

  onChooseBackgroundImage(backgroundImage) {
    if (backgroundImage === 'none') {
      backgroundImage = null
    }
    this.onUpdate({
      backgroundImage
    })
  }

  onChooseForegroundImage(foregroundImage) {
    if (foregroundImage === 'none') {
      foregroundImage = null
    }
    this.onUpdate({
      foregroundImage
    })
  }

  onChooseAtomToPlot(atomToPlot) {
    this.setState({
      atomToPlot
    })
  }

  plotAtom(coords) {
    console.warn('[plotAtoms]', this.state.atomToPlot, 'at', coords)
    if (this.state.atomToPlot === 'none') {
      return
    }
    const [x, y, z] = coords
    this.onUpdate({
      instances: [
        ...this.state.resource.instances,
        {
          atomId: this.state.atomToPlot,
          x,
          y,
          z
        }
      ]
    })
  }

  updateTouchCoords(coords) {
    // console.warn('[updateTouchCoords] coords', coords)
    this.setState({
      touchCoords: {
        x: coords[0],
        y: coords[1],
        z: coords[2]
      }
    })
  }

  render() {
    const atomDropperResources = getAtomDropperResources(this.props.resources)
    const imageDropperResources = getImageDropperResources(this.props.resources)

    const backgroundImage = (this.state.resource.backgroundImage === null ? 'none' : this.state.resource.backgroundImage)
    const foregroundImage = (this.state.resource.foregroundImage === null ? 'none' : this.state.resource.foregroundImage)
    return (
      <StyledResource>
        <section className='settings-plot-info'>
          <Box className='settings'>
            <div className='coords'>
              <Input label='Width' type='number' value={this.state.resource.width} onChange={(v) => this.onChangeMasterProp('width', v)} min='0' max='4096' />
              <Input label='Height' type='number' value={this.state.resource.height} onChange={(v) => this.onChangeMasterProp('height', v)} min='0' max='4096' />
              <Input label='Cam Width' type='number' value={this.state.resource.camera.width} onChange={(v) => this.onChangeCameraProp('width', v)} min='0' max='4096' />
              <Input label='Cam Height' type='number' value={this.state.resource.camera.height} onChange={(v) => this.onChangeCameraProp('height', v)} min='0' max='4096' />
              <Input label='Cam X' type='number' value={this.state.resource.camera.x} min='0' onChange={(v) => this.onChangeCameraProp('x', v)} max='4096' />
              <Input label='Cam Y' type='number' value={this.state.resource.camera.y} min='0' onChange={(v) => this.onChangeCameraProp('y', v)} max='4096' />
            </div>
            <Dropper options={imageDropperResources} value={backgroundImage} onChoose={this.onChooseBackgroundImage} label='Background image' />
            <Dropper options={imageDropperResources} value={foregroundImage} onChoose={this.onChooseForegroundImage} label='Foreground image' />
          </Box>
          <Box className='plot'>
            <Dropper options={atomDropperResources} value={this.state.atomToPlot} label='Atom to plot' onChoose={this.onChooseAtomToPlot} />
          </Box>
          <Box className='info'>
            <Input label='Touch X' value={this.state.touchCoords.x} type='number' disabled />
            <Input label='Touch Y' value={this.state.touchCoords.y} type='number' disabled />
          </Box>
        </section>
        <section className='canvas'>
          <SpaceCanvas space={this.state.resource} resources={this.props.resources} designMode={true} onTouch={this.plotAtom} onTouchMove={this.updateTouchCoords} />
        </section>
      </StyledResource>
    )
  }
}

ResourceSpace.propTypes = {
  resources: PropTypes.array,
  resource: PropTypes.object.isRequired,
  onUpdate: PropTypes.func
}

ResourceSpace.defaultProps = {
  onUpdate: () => {}
}

export default ResourceSpace

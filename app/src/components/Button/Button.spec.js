import React from 'react'
import renderer from 'react-test-renderer'
import 'jest-styled-components'
import Button from './Button'

it('renders', () => {
  const tree = renderer
    .create(
      <Button hint='Do Something'>Do Something</Button>
    )
    .toJSON()
  expect(tree).toMatchSnapshot()
})

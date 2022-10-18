import { ComponentMeta, ComponentStory } from '@storybook/react'
import AppItem from '.'

export default {
  id: 'appItem',
  title: 'app项',
  component: AppItem
} as ComponentMeta<typeof AppItem>

const Template: ComponentStory<typeof AppItem> = (args) => (
  <div style={{ margin: 20 }}>
    <AppItem {...args} />
  </div>
)

export const DefaultAppItem = Template.bind({})
DefaultAppItem.storyName = '应用信息'

import { ComponentMeta, ComponentStory } from '@storybook/react'
import { SearchInput } from '.'

export default {
  id: 'search-input',
  title: '搜索框',
  component: SearchInput
} as ComponentMeta<typeof SearchInput>

const Template: ComponentStory<typeof SearchInput> = (args) => (
  <div style={{ width: 350, height: 48 }}>
    <SearchInput {...args} />
  </div>
)

export const Default = Template.bind({})
Default.storyName = '默认'

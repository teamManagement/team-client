import { ComponentMeta, ComponentStory } from '@storybook/react'
import MessageEdit from '.'

export default {
  id: 'messageEdit',
  title: '内容编辑框',
  component: MessageEdit
} as ComponentMeta<typeof MessageEdit>

const Template: ComponentStory<typeof MessageEdit> = (args) => (
  <div>
    <MessageEdit {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  actionEleList: [
    <img
      key="1"
      style={{
        width: '23px',
        height: '23px'
      }}
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAyVJREFUOE+NlU9IFHEUx79vZi2D/ozgoYOWUp0z8NChYA8F/aGazRWq3VnXS5AkO2IRUZJREVHiLEZBBG67bgWbOVZUtxa6eAgqOmZo6cFDsGZBmju/F79ddxh1Eef4m/c+877vfX9vCGUefzRauTGvNakKdAYaCaiTYQyME/OIw/Rqxjc9mE0kZpem09IDPRxrIgV3makahCyYRwD6VozjbSDaDYafwFPMMO2B+KCX4QL9fr9Pq224TQSTGYk54XS9SfdNllOgnzDrUIErRIgCuJP78eliNpvNy1gXqBtmL4CzENxqp+MD5UDL1IRiYSjUTwRrKGmdd4FFmfSMHTZWCyvB9VAsTCqlWHBQyic5gCqxaYyZ3topq3U1lS2r1DD7Cbwvp/7aQUfDZkihQs/qvT0LGLH7AE0OpawbXkDAMC8JcM1wKn7GrbLY06+CEaVAxMwwoNlJa78boJsabeAJJhq1k9auxcDYFwB1/JtqbduadnMM852cPOkRcwxAwk5aV72Jum5q0xX/8tnMvT/ec39z23ptfo3PC5PvdSN2DURhWSEzo9VOWYlCPx2tkwm+1fSSGPmcOt0jDa4bZpQI/YuA0l+0BmMMfALDlVMWTtAIaOB/qLefWuNe4BgzD9ipeJc0d1XtzhwI14eS8VsrVRmIxC6AcTk38blKmlpKpgXJi4aiR2J9BATn/s7vep25N1UOeqi5bfPadRUfmempnbI6ij0sDWXB7SXbHDl5utpXse49g2ZBTtB+1Ldwj4tovaV9GwnFBsGXn/+79+WTBz8XruJXAWGUNfbBUHtNpapkmKkR4Lcg+lDcDdwI0AEi/jDriOaSb3WvsWXcsVB7UFHVjCMQfjFgpV1vhU0dCjdJ3xWBNEqCB4fS8VelmECkowXghHCc5uF03zN3OQQi5m25jqTbvdCVB9PRwswPly0HmVSY8JaGmwDOyfWlOGr388c938sBj5/q3CpUp3vF9VVKLMhXlF4GbQaQBXiESBkttlBsB2gPgD3ymgkhOqRM70eXbexCtdFopTa/KUgKDhc2dKmHwLjc4A54eEadscv9Av4DWvWU2dRhJM4AAAAASUVORK5CYII="
    />,
    <img
      key="2"
      style={{
        width: '23px',
        height: '23px'
      }}
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAyVJREFUOE+NlU9IFHEUx79vZi2D/ozgoYOWUp0z8NChYA8F/aGazRWq3VnXS5AkO2IRUZJREVHiLEZBBG67bgWbOVZUtxa6eAgqOmZo6cFDsGZBmju/F79ddxh1Eef4m/c+877vfX9vCGUefzRauTGvNakKdAYaCaiTYQyME/OIw/Rqxjc9mE0kZpem09IDPRxrIgV3makahCyYRwD6VozjbSDaDYafwFPMMO2B+KCX4QL9fr9Pq224TQSTGYk54XS9SfdNllOgnzDrUIErRIgCuJP78eliNpvNy1gXqBtmL4CzENxqp+MD5UDL1IRiYSjUTwRrKGmdd4FFmfSMHTZWCyvB9VAsTCqlWHBQyic5gCqxaYyZ3topq3U1lS2r1DD7Cbwvp/7aQUfDZkihQs/qvT0LGLH7AE0OpawbXkDAMC8JcM1wKn7GrbLY06+CEaVAxMwwoNlJa78boJsabeAJJhq1k9auxcDYFwB1/JtqbduadnMM852cPOkRcwxAwk5aV72Jum5q0xX/8tnMvT/ec39z23ptfo3PC5PvdSN2DURhWSEzo9VOWYlCPx2tkwm+1fSSGPmcOt0jDa4bZpQI/YuA0l+0BmMMfALDlVMWTtAIaOB/qLefWuNe4BgzD9ipeJc0d1XtzhwI14eS8VsrVRmIxC6AcTk38blKmlpKpgXJi4aiR2J9BATn/s7vep25N1UOeqi5bfPadRUfmempnbI6ij0sDWXB7SXbHDl5utpXse49g2ZBTtB+1Ldwj4tovaV9GwnFBsGXn/+79+WTBz8XruJXAWGUNfbBUHtNpapkmKkR4Lcg+lDcDdwI0AEi/jDriOaSb3WvsWXcsVB7UFHVjCMQfjFgpV1vhU0dCjdJ3xWBNEqCB4fS8VelmECkowXghHCc5uF03zN3OQQi5m25jqTbvdCVB9PRwswPly0HmVSY8JaGmwDOyfWlOGr388c938sBj5/q3CpUp3vF9VVKLMhXlF4GbQaQBXiESBkttlBsB2gPgD3ymgkhOqRM70eXbexCtdFopTa/KUgKDhc2dKmHwLjc4A54eEadscv9Av4DWvWU2dRhJM4AAAAASUVORK5CYII="
    />
  ]
}
Default.storyName = '默认'

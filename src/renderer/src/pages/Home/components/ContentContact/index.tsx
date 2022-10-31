import { FC } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MyContacts } from './components/MyContacts'
import { OrgContact } from './components/OrgContact'
import { SidebarItem } from './components/SidebarItem'
import './index.scss'

export const ContentContact: FC = () => {
  return (
    <div className="content-contact">
      <div className="content-contact-sidebar">
        <SidebarItem
          targetUrl="/home/contact/myContacts"
          iconUrl={
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAAAXNSR0IArs4c6QAAA3JJREFUWEftmUloFGkUx3+vs3dcWkW0CTFRwRVXXAIKc/Iw6qEVjCA6zEkQPLgFPQwMiogielBB8eSghwFRB2RGxosOjLaKYgIuqBGmx0TjhrFj1KSTevJVYkSsVFeXH9qH1KEb+nvLr/7f8l51Cb2XXl9bRKb1Z4WfUGYgMvjj2Df+TqM0iOhximLHZM7RjMkv5kOTiWql5DQw6xtD+adTrRftSsiC0ynRC4mYlhZfApmSV5B9MHpXutoXSHeydqMg+/MTsodK0E3iJGuvgszLZ1DQawa0A6Q4z0E7xUmu1PyG7J3+AVDL0zQw9ZYF5SsVFRhRA6MWIeVjQQrRtylo+Rte/GtqnjXe8KAFUZhYhwyZ7AmjrfVwfz84nVZgw4NO2IgMn+8Loc//gYeHvyNo+Thk2q7sAOqg9Rug41l22ywW4RStXIlULAuUXFPH4cmfgWz9jMKBjl+HjPwhUHJtOQf//RbI1j5o1RokviRQcm06BU0nA9naBx02B5m4JVByvb0d2u4GsrUPah4Mpu9BomP8d/2bRrj1y1dDuj1p6KakrBKm/ooUDvIGef8EvbMTOl/2jvsd/u4Tke8VHtSEjVYhU3dAQcnnSTJtqFGy42nP76og2WDMjfRvEw40WgUVCWTYXIgUeivhZNCXV6D5FLxvAbP5opXetqYwpO9YBo0vRsascut6kEtNzW88BJO2IbGZX7poN5o6AeYYc3sDb1VzU7RiOVJZG4Tvk01XO9qwGTKvfPwMnK2pj81EJm3LDdKkf9cMDXVQOgqKY97+7Snoavddx8EUjZTCrANI0ZDcQZ9fhIdHkBn7oKzC01+b/4BHv1vY9fGlSNXqnCHdDd+n6Oh+FFV42wSZtAVFp+1GyqtDgZop7VmjrVn8LaxRmXei/2MoW/oXl6DxoP+uN03L0/MWdv349cjIhaEU1Vc34N5eiC/1OUcvQtq/Hwi2maQAhtdAWTwULI/PgtPRv69bucyw7coUCtdvDfqvT/cWQjcloWDDOw2AhtfO29P87WhqV9R2YMvx0mbqk0CN5cC2w10WTdZuVWS37cg244noFtHLK8pU5HrevmxQbstQZ7Z7wr5LJqpLtPgMIh6drU1tco51U7qdhCw8+X9fKdC/fixxhg6ui0RIqDLh+70Q0zbggTqcibxu2yuLz7kl7QPLqmW0ZGxBRwAAAABJRU5ErkJggg=='
          }
          iconBackgroundColor="rgb(254, 199, 87)"
          desc="通讯录"
        />
        <SidebarItem
          targetUrl="/home/contact/myContacts1"
          iconUrl={
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAAAXNSR0IArs4c6QAABDNJREFUWEftmVtMHFUcxr8zswvs4pZyWYQCu7QoQUKKCC1NrfHaq21caPpg0xg0RJI+UMWSptGavlhrmmhSTRp1IzVNfTAC2lLqJY22TbUQDOJC1my35X4pFLou0l0Gdo+ZEYkt3Zkze2Fr0vOw+zDfme833znnP2dmCOZacdvH2uw4TQWl9CUAhQQw/HtsUf8J3AA6AHKixzt7/NeSqhnRn4g/lvZj2RyvbSAERYsKpWhGf6M8sTTkV/YSS3vdUl7juwQgX7FfFASUUvs0Zh4nZb9bX+cI3o8CA7Oln6KGlNusLQRYzdwrCkIKtJLtNus0gJgo+KuxFERQqqZHtLT3QcOd/P1E78lES5eY8XxyAUxxiYjjNOj3uvDdhB3nbjpAEZ61GtLQExC8umwt1ifl3TVA219DONz3A6b9syEHHBLoi6nF2J76qCzEBZcTRwfORw9Ux2lhzduJWE6jCFHt+ApDwp+KOjlB0ImuMpiwz7yeybxu+DLOjHcxaQOJggZ9JjEXuzOeYDJvutGJ4yMtTNqwgxYbsrDfvIHJ/MRIK765YWPShh1Uz8VIczSG42UBHLdG8eHAeQwJboiVikhbdfUt6KEXrXY+WIJyY+FdXX3Uj48GL+Ci6yo4EMTzMZj0iRs1kZdCLG1qWkigPDjUZD2N0oTsBZ6fDV9G83gXdhiLUGYslJLv9ozjg/4fMSi4AEpUpRsSqJjU6iVmvJK+Bkna+HnYKd80XrafxIakPFQuW3vbRYwKk9hzpR4CnVWVatCg+fo0VGWsQ0ZswoI0O6eGcbC7GW9nb8LKBzIWHH/rWhPst66rGvygQC0pK7ErbVXAKWafGsGB7jN407wRRYbMBbr9V0/B4RmNbKJbkwtQkV4quw48/hlU/vEFig0maQ7/t/V5b6LG2aB6QalK9GGdEe+s2AZOocaIJend3u+lVf5a5lNYtzRHYhUv4MC1JvR4J+Z2VexrXxXoezkvIEeXIpum0zMmzc8kTTyqs57EQzrjbXrB70P9WDvqxzpAKQVhLKzMoAXx6Ti4fIsspFg79zq/htc/g0MrtiFRqw+obxzrwMnrbaCMNwFm0Iq0UmxNKZAFbXH34EjfOdSanoO4mVZqbzgb0eMdZ1pUYQU9NngRre5e1D2yS4lROi7e/8V9gPgMoHSfYgZN1OhRa3oWufrUgBCfD7fg2wm7NOzLdcmysOJc/WToEn5yORgwAWZQlohYkrnzPKx9wgoqbTjmnJWG8h9tBFY9S6KR1IQ90UjB/n9Ay23WKQIErsyRikjded2k3PbpLwRkjbp+i62mP5OyTus+juLwYlur8aOge8mO/i91fpe77R7+2NDF8wmPzX++4TWaRoDIv59RE0M4tBTtguCznC6p6puvy5ubj8bqMuNqQTgLgNxofRCjwCQovQLQRs+A98jZLdXSo+vfO22mVwXq98wAAAAASUVORK5CYII='
          }
          iconBackgroundColor="rgb(83, 211, 156)"
          desc="群组"
        />
        <SidebarItem
          targetUrl="/home/contact/orgContacts"
          iconUrl={
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAAA4dJREFUWEftmM9rXFUUx7/n3HvfZJpJm9hJnUyN4tpVRQRFEVx1IZQuDKVLW10UCkK1/4jgQltXIiEKpeDChRtRFESELrpwIbaNTUubkqRRJ/PuvefIe+kkM2OaeTP5MQre1bw3553zueecd859h9C+3lk4cPSwlNPg3QgZ7vhvly/WNEpinb/9gBv4qP5XSz3lP96cM2NPvzIxbkKyy3YLqVuONl299d0SPp+JBCjVzt+turJ3hZ7eIyHfcP7uB7VFevK9a6MJTxzaIzt9qU1laYXqFxaqZkih6qaNsZFS9d0bU+WE13NpyKuRitL0xVv1IXN0mN8xkARfUeK8RJCKsHV/7GSDAwOpp8PE/gRIJzoAlJZU3FVy+mAQsIGBEMNbOYzoHWEKmXEWtWCagtISjP1k34BijAcNydsZDGzyWYfhkJ7OoKLyx8aYh/1CDeShFpAA88xurt2oiJ9hYPp/oCxkIrjN1s12eCj4U8w4uq8eygFCegZM41D8CkIju6WgUYI+C9Fl2ORyv/mTl45BC2MA6kb8GwSMtRtWYDWy+9ICC/sKlHvEEwmHMSY5lV2L8iyLXSWnOghM3x5SH56C1eluYyT0fA7I+vM/QALNk7O/FwXsL2StYlhUe07ZX5HsC0hjPEskh0jpqyJMSnpclVfImEtF5AuHLAZjAF8llpMMHY1iPgXcorExbmUok1dqHLFEpwX0pwpf2U6+XUdPD2XdnIlmupuoKlYEPNfdHrIqzpAZInSeQteb7iw53TjQb7WZnkAxpK8aphcVepOE8qOFMh3I6o2IXmObfN3x2kt4naDHFPQbybpxZa0Q6Jko+qOxybfbha8nEII/DsZz7ZW331622YxxHdZtm3//XSCv9rIztJy5u7XjPIycfNGr2/uo447CGcgueEiDf4kYLwtkEeC8ZwFSZnAVip9g3DcdORH9ayC8sJW8Cr4n637YUQ6lIiUr8QQzOit0djgzegVUegT5yIw2y4h0Mj85ti0RzAc2VxPm5o6AWg83tVm2YvOvWxYber2+7fKBgy91gz+GqndSFy2xuyRHk+/fq43Q2p5OOoqyZhMRql/4pWpMeShTj25QMdykyXPXKyOVsYNFd7GXcqkkK9k3PdXO3/mXjGOm7m8MrGq1Y0+4cmkoM6IYbbqwObDaDMLkuXsVVw4jnpt2P0Z6TkrBN+za/Q+PbMwD/gb/pvaEzvBdGgAAAABJRU5ErkJggg=='
          }
          desc="组织架构"
        />
      </div>
      <div className="content-contact-content-routes">
        <Routes>
          <Route path="myContacts/*" element={<MyContacts />} />
          <Route path="orgContacts/*" element={<OrgContact />} />
          <Route path="*" element={<Navigate to="/home/contact/myContacts" />} />
        </Routes>
      </div>
    </div>
  )
}

export default ContentContact

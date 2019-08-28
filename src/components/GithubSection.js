import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Card, Progress, Button, Row, Col, Statistic, Icon, Typography } from 'antd'
import { LineChart, AreaChart, Line, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

import DataUnit from './DataUnit'

import GithubRepoScript from '../scripts/GithubRepoScript'

import { updateState, updateStatsField } from '../actions'

const { Title } = Typography


class GithubSection extends React.Component {
  constructor(props) {
    super(props)

    this.GithubRepoScript = new GithubRepoScript()
  }

  _fetchRepositoryData = () => ({
    type: this.GithubRepoScript.fetchRepositoryData,
    onFinish: stats => {
      this.props.updateState('repoStats', stats)
    }
  })

  _fetchStargazerData = () => ({
    // this.setState({ starLoading: true, starProgress: 0 })
    // this.GithubRepoScript.fetchStargazerData(
    //   data => this.setState({ starData: data, starReady: true, starLoading: true }),
    //   stats => this.setState(prevState => ({ starStats: {...prevState.starStats, ...stats}, starLoading: false })),
    //   progress => this.setState({ starProgress: progress })
    // )
    type: this.GithubRepoScript.fetchStargazerData,
    onUpdate: data => {
      this.props.updateState('starData', data)
    },
    onFinish: stats => {
      this.props.updateState('starStats', stats)
    }
  })

  _getStarIncrementData = () => {
    const { starData, starStats, updateStatsField } = this.props
    const formattedData = []
    starData.forEach((value, key) => {
      formattedData.push({
        date: key,
        stars: value,
      })
      if (!starStats.maxIncrement || value > starStats.maxIncrement) {
        updateStatsField('starStats', { maxIncrement: value })
      }
    })
    return formattedData
  }

  _getStarTotalData = () => {
    const { starData } = this.props
    const formattedData = []
    let cumulativeStarCount = 0
    starData.forEach((value, key) => {
      cumulativeStarCount += value
      formattedData.push({
        date: key,
        stars: cumulativeStarCount,
      })
    })
    return formattedData
  }

  _renderRepositoryStatistics = () => {
    const { owner, name, createdAt } = this.props.repoStats

    const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))

    return (
      <div>
        <Row>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Repository" value={owner + "/" + name} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Date Created" value={new Date(createdAt).toDateString()} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Days since created" value={dateSinceCreated} />
          </Card></Col>
        </Row>
      </div>
    )
  }
  _renderStarStatistics = () => {
    const { totalStar, maxIncrement, createdAt } = this.props.starStats

    const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
    const averageStarPerDay = totalStar / dateSinceCreated

    return (
      <div>
        <Row>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Total Stars" value={totalStar} prefix={<Icon type="star" />} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Avg. Star/day" value={averageStarPerDay} precision={2} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Max increment a day" value={maxIncrement} />
          </Card></Col>
        </Row>
      </div>
    )
  }

  _renderStarCharts = () => (
    <div>
      <Row>
        Total Stars
      </Row>
      <Row>
        <ResponsiveContainer width="95%" height={300}>
          <AreaChart data={this._getStarTotalData()}>
            <defs>
              <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffb900" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ffb900" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="stars" stroke="#ffb900" fill={"url(#gradientArea)"} dot={false}/>
            <CartesianGrid stroke="#ccc" strokeDasharray="2 7" />
            <XAxis
              dataKey="date"
              domain = {['auto', 'auto']}
              type="number"
              tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
            />
            <YAxis />
            <Tooltip
              // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
              labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Row>
      <Row>
        Daily increment
      </Row>
      <Row>
        <ResponsiveContainer width="95%" height={300}>
          <LineChart data={this._getStarIncrementData()}>
            <Line type="monotone" dataKey="stars" stroke="#ffb900" dot={false}/>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 7" />
            <XAxis
              dataKey="date"
              domain = {['auto', 'auto']}
              type="number"
              tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
            />
            <YAxis />
            <Tooltip
            // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
              labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
            />
          </LineChart>
        </ResponsiveContainer>
      </Row>
    </div>
  )

  render() {
    // const dotStyle = {strokeWidth: 2, r: 2.5}
    return (
      <Card className="Section-div">
        <DataUnit
          title="Repository"
          iconType="book"
          iconColor="#222"
          action={this._fetchRepositoryData()}
        >
          {this._renderRepositoryStatistics()}
        </DataUnit>

        <DataUnit
          title="Star Trend"
          iconType="star"
          iconColor="#ffb900"
          action={this._fetchStargazerData()}
        >
          {this._renderStarStatistics()}
          {this._renderStarCharts()}
        </DataUnit>
      </Card>
    )
  }
}

GithubSection.propTypes = {
  updateState: PropTypes.func,
  updateStatsField: PropTypes.func,

  repoStats: PropTypes.object,
  starStats: PropTypes.object,
  starData: PropTypes.any,
}

const mapStateToProps = state => ({
  repoStats: state.github.repoStats,
  starStats: state.github.starStats,
  starData: state.github.starData,
})

const mapDispatchToProps = dispatch => ({
  updateState: (state, data) => dispatch(updateState(state, data)),
  updateStatsField: (state, stats) => dispatch(updateStatsField(state, stats))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GithubSection)
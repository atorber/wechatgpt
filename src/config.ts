#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/* eslint-disable sort-keys */
/*
修改config.json配置文件，即修改api配置
*/
import fs from 'fs'
import type { BaseConfig, ChatData, WhiteList } from './types/mod.js'
import { BaseEntity, VikaOptions, MappingOptions, wait } from 'vika-orm'
import dotenv from 'dotenv'
// 加载环境变量
dotenv.config()

const vikaOptions: VikaOptions = {  // 定义 Vika API 的选项
  apiKey: process.env['VIKA_API_KEY'] || '', // 从环境变量中读取 Vika API 密钥
  baseId: process.env['VIKA_BASE_ID'] || '', // 从环境变量中读取 Base ID
}

const mappingOptions: MappingOptions = {  // 定义字段映射选项
  fieldMapping: {  // 字段映射
    wxid: 'wxid',  // 定义 wxid 字段
    endpoint: 'endpoint',
    historyContextNum: 'historyContextNum',
    key: 'key',
    maxTokenNum: 'maxTokenNum',
    systemPrompt: 'systemPrompt',
    temperature: 'temperature',
    timeout: 'timeout',
    userPrompt: 'userPrompt',
  },
  tableName: 'wechat-gpt',  // 表名
}

/**
     * 用户实体
     */
class Config extends BaseEntity {  // 用户类继承 BaseEntity

  wxid?: string  // 定义 wxid 字段
  endpoint?: string  // 定义 endpoint 字段
  historyContextNum?: number  // 定义 historyContextNum 字段
  key?: string  // 定义 key 字段
  maxTokenNum?: number  // 定义 maxTokenNum 字段
  systemPrompt?: string  // 定义 systemPrompt 字段
  temperature?: number  // 定义 temperature 字段
  timeout?: number  // 定义 timeout 字段
  userPrompt?: string  // 定义 userPrompt 字段

  // protected static override recordId: string = ''  // 定义记录ID，初始为空字符串

  protected static override mappingOptions: MappingOptions = mappingOptions  // 设置映射选项为上面定义的 mappingOptions

  protected static override getMappingOptions (): MappingOptions {  // 获取映射选项的方法
    return this.mappingOptions  // 返回当前类的映射选项
  }

  static override setMappingOptions (options: MappingOptions) {  // 设置映射选项的方法
    this.mappingOptions = options  // 更新当前类的映射选项
  }

}

Config.setVikaOptions(vikaOptions)  // 设置 Vika API 选项

export const baseConfig: BaseConfig = {
  admin: {
    name: '管理员信息',
    items: {
      roomTopic: {
        name: '管理员群',
        value: process.env['ADMIN_ROOM_TOPIC'] || '', // 管理群名称
      },
      wxName: {
        name: '管理员微信',
        value: process.env['ADMIN_WX_NAME'] || '', // 管理员微信昵称
      },
      roomid: {
        name: '管理员群',
        value: process.env['ADMIN_ROOM_ID'] || '', // 管理群名称
      },
      wxid: {
        name: '管理员微信',
        value: process.env['ADMIN_WX_ID'] || '', // 管理员微信昵称
      },
    },
  },
  baiduvop: {
    name: '百度云语音转文字服务',
    items: {
      ak: {
        name: 'Access Key',
        value: process.env['BAIDUVOP_AK'] || '', // 百度云语音转文字接口ak
      },
      sk: {
        name: 'Secret Key',
        value: process.env['BAIDUVOP_SK'] || '', // 百度云语音转文字接口sk
      },
    },

  },
  openai: {
    name: 'ChatGPT配置信息',
    items: {
      endpoint: {
        name: 'API地址',
        value: process.env['OPENAI_API_BASE_URL'] || 'https://api.openai.com',
      },
      key: {
        name: 'API密钥',
        value: process.env['OPENAI_API_KEY'] || '',
      },
      model: {
        name: '模型版本',
        value: process.env['OPENAI_MODEL'] || '',
      },

    },

  },
  wechaty: {
    name: 'Wechaty',
    items: {
      puppet: {
        name: 'Puppet名称',
        value: process.env['WECHATY_PUPPET'] || 'wechaty-puppet-wechat4u', // wechaty-puppet-padlocal、wechaty-puppet-service、wechaty-puppet-wechat、wechaty-puppet-wechat4u、wechaty-puppet-xp（运行npm run wechaty-puppet-xp安装）
      },
      token: {
        name: 'PuppetToken',
        value: process.env['WECHATY_TOKEN'] || '', // wechaty token
      },
    },

  },
}

const userConfig: any = JSON.parse(fs.readFileSync('data/config.json', 'utf8'))
const userHistory: any = JSON.parse(fs.readFileSync('data/history.json', 'utf8'))
const talk: any = JSON.parse(fs.readFileSync('data/talk.json', 'utf8'))
const record: any = JSON.parse(fs.readFileSync('data/record.json', 'utf8'))

export class BotConfig {

  wxid: string

  constructor (wxid: string) {
    this.wxid = wxid
  }

  saveConfigFile (curConfig: WhiteList) {
    userConfig[this.wxid] = curConfig
    fs.writeFileSync('data/config.json', JSON.stringify(userConfig, null, '\t'))

    const whiteList = curConfig.whiteList
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    Object.keys(whiteList).forEach(async (item: any) => {
      const configInfo = whiteList[item]
      if (configInfo && item !== 'wxidorroomid') {
        try {
          const config = new Config()
          const query2Res = await Config.findByField('wxid', item)
          // console.info('查询findByField:', JSON.stringify(query2Res))  // 输出更新后的新用户信息
          await wait(1000)  // 等待 500 毫秒

          if (query2Res.length === 0) {
            config.wxid = item
            config.endpoint = configInfo.endpoint
            config.historyContextNum = configInfo.historyContextNum
            config.key = configInfo.key
            config.maxTokenNum = configInfo.maxTokenNum
            config.systemPrompt = configInfo.systemPrompt
            config.temperature = configInfo.temperature
            config.timeout = configInfo.timeout
            config.userPrompt = configInfo.userPrompt
            config.save()
            await wait(1000)
          }
        } catch (e) {
          console.error('更新用户信息失败:', e)
        }
      }
    })
  }

  updateHistory (curHistory: ChatData) {
    userHistory[this.wxid] = curHistory
    fs.writeFileSync('data/history.json', JSON.stringify(userHistory, null, '\t'))
  }

  updateRecord (curRecord: any) {
    record[this.wxid] = curRecord
    fs.writeFileSync('data/record.json', JSON.stringify(record, null, '\t'))
  }

  updateTalk (curTalk: any) {
    talk[this.wxid] = curTalk
    fs.writeFileSync('data/talk.json', JSON.stringify(talk, null, '\t'))
  }

  updateData (data: any, filename: string) {
    fs.writeFileSync(`data/${filename}.json`, JSON.stringify(data, null, '\t'))
  }

  getConfig () {
    const curConfig = userConfig[this.wxid]
    return curConfig
  }

  getHistory () {
    const curHistory = userHistory[this.wxid]
    return curHistory
  }

  getTalk () {
    const curTalk = talk[this.wxid]
    return curTalk
  }

  getRecord () {
    const curRecord = record[this.wxid]
    return curRecord
  }

  getChatGPTConfig (textArr: string[]) {

    const config = {
      endpoint: textArr[2],
      historyContextNum: 6,
      key: textArr[1],
      maxTokenNum: 2048,
      systemPrompt: '',
      temperature: 1,
      timeout: 60,
      userPrompt: '',
    }

    return config

  }

  storeHistory (history: ChatData, id: string, role: 'user' | 'assistant' | 'system', content: string) {
    if (history[id]) {
      history[id]?.historyContext.push({ content, role })
      history[id]?.time.push(new Date().toLocaleString())
    } else {
      history[id] = {
        historyContext: [],
        time: [],
      }
      history[id]?.historyContext.push({ content, role })
      history[id]?.time.push(new Date().toLocaleString())
    }
    userHistory[this.wxid] = history
    return history

  }

}

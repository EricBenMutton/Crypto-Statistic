import { Client, withTenantToken } from '@larksuiteoapi/node-sdk';
import { v4 as uuidv4 } from 'uuid';

const client = new Client({
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
});

function createFeishuClient() {
    if (!process.env.FEISHU_APP_ID
        || !process.env.FEISHU_APP_SECRET
        || !process.env.FEISHU_APP_TOKEN
        || !process.env.FEISHU_TABLE_ID) {
        console.error('请在 .env 文件中配置飞书相关参数');
        return;
    }

    const client = new Client({
        appId: process.env.FEISHU_APP_ID || '',
        appSecret: process.env.FEISHU_APP_SECRET || '',
        disableTokenCache: false
    });

    return client;
}


export async function updateTable(exchangeTotalMap: Map<string, number>) {
    const client = createFeishuClient();

    if (!client) {
        console.error('请在 .env 文件中配置飞书相关参数');
        return;
    }

    const fileds = new Map<string, string | number>();
    fileds.set("日期", new Date().getTime());
    for (const [key, value] of exchangeTotalMap.entries()) {
        fileds.set(key.toUpperCase(), value);
    }

    try {
        await client.bitable.appTableRecord.create({
            path: {
                app_token: process.env.FEISHU_APP_TOKEN || '',
                table_id: process.env.FEISHU_TABLE_ID || '',
            },
            params: {
                user_id_type: 'open_id',
                client_token: uuidv4(),
                ignore_consistency_check: false,
            },
            data: {
                fields: Object.fromEntries(fileds),
            },
        });
    } catch (error) {
        console.error('更新飞书表格失败', error);
    }

    // 发送飞书消息
    try {
        const total = Array.from(exchangeTotalMap.values()).reduce((acc, curr) => acc + curr, 0);
        const messageContent = {
            text: `最新余额: <b>${total}</b>, [点击前往查看](https://yvwhpyaehx.feishu.cn/base/PozbbxxplapYKksFjqlcg6PJnAg?table=tblG1aRTN9WMOh2h&view=vew5pafusT)`
        }
        client.im.v1.message.create({
            params: {
                receive_id_type: 'user_id',
            },
            data: {
                receive_id: process.env.FEISHU_USER_ID || '',
                msg_type: 'text',
                content: JSON.stringify(messageContent),
                uuid: uuidv4(),
            },
        });
    } catch (error) {
        console.error('发送飞书消息失败', error);
    }
}

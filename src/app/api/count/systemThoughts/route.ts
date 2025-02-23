import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
})

export async function GET(request: Request) {
    console.log(request);
    const thoughts = await redis.get('thoughts');
    return Response.json({ thoughts : thoughts });
}
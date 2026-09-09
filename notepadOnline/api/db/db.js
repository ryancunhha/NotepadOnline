import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config()

const redis = createClient({
    url: process.env.REDIS_URL
})

redis.on("erro", (err) => console.log("Erro no redis:", err))

await redis.connect()

export default redis
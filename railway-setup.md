# Railway Database Setup

1. Go to railway.com
2. Create new project
3. Add PostgreSQL service
4. Get connection string from Railway dashboard
5. Update .env with Railway connection

Railway provides:
- Free tier with PostgreSQL
- Simple setup
- Easy connection strings
- Good for development

## Alternative: Supabase
1. supabase.com
2. Create project
3. Get connection string from settings
4. Use pooling connection for better performance

For production deployment, we'll need to:
1. Set up environment variables in Vercel
2. Use the production database URL
3. Run prisma db push in production
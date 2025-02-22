export async function GET(request: Request) {
    console.log(request);
    return Response.json({ doQuyen : true });
}
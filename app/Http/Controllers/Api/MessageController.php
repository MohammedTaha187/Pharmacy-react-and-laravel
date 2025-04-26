<?php

namespace App\Http\Controllers\Api;


use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{

    public function index()
    {
        return response()->json(Message::with('user')->latest()->get());
    }


    public function store(Request $request)
    {

        $userId = auth()->id();


        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }


        $message = Message::create([
            'user_id' => $userId,
            'message' => $request->message,
        ]);

        return response()->json($message, 201);
    }



    public function show($id)
    {
        $message = Message::with('user')->find($id);
        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }
        return response()->json($message);
    }


    public function update(Request $request, $id)
    {
        $message = Message::find($id);
        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'response' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message->update($request->only('response'));
        return response()->json($message);
    }

    public function destroy($id)
    {
        $message = Message::find($id);
        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }
        $message->delete();
        return response()->json(['message' => 'Message deleted successfully']);
    }
}

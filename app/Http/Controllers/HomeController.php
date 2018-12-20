<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\CallUser;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('home');
    }

    public function callUser($id, Request $r)
    {  
        $data = [
            'data' => $r->data,
            'type' => $r->type
        ];
        broadcast(new CallUser($id, $data));
        return ['data' => $data];
    }
}

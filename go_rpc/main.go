package main

import (
	"connectrpc.com/connect"
	"context"
	calculatorv1 "go_rpc/gen/calculator/v1"
	"go_rpc/gen/calculator/v1/calculatorv1connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"log"
	"net/http"
	"strconv"
)

var (
	SUCCESS int64 = 1 //成功
	FAIL    int64 = 2 //失败
)

type CalculatorServer struct{}

func (s *CalculatorServer) Calculator(ctx context.Context,
	req *connect.Request[calculatorv1.CalculatorRequest]) (*connect.Response[calculatorv1.CalculatorResponse], error) {

	// 根据操作符执行对应的计算
	ret := &calculatorv1.CalculatorResponse{
		Code:   strconv.FormatInt(SUCCESS, 10),
		Result: "",
		Msg:    "success!",
	}
	switch req.Msg.Operator {
	case "+":
		ret.Result = strconv.FormatInt(req.Msg.ParamA+req.Msg.ParamB, 10)
	case "-":
		ret.Result = strconv.FormatInt(req.Msg.ParamA-req.Msg.ParamB, 10)
	case "*":
		ret.Result = strconv.FormatInt(req.Msg.ParamA*req.Msg.ParamB, 10)
	case "/":
		ret.Result = strconv.FormatInt(req.Msg.ParamA/req.Msg.ParamB, 10)
	default:
		log.Printf("Invalid operator!\n")
		ret.Code = strconv.FormatInt(FAIL, 10)
		ret.Msg = "Invalid operator!"
	}
	log.Printf("Client Call: %d%s%d=%s\n", req.Msg.ParamA, req.Msg.Operator, req.Msg.ParamB, ret.Result)

	res := connect.NewResponse(ret)

	return res, nil
}

// corsMiddleware 包装 handler，增加跨域支持
func corsMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 允许任意域名跨域
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// 允许的请求头
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		// 允许的方法
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		// 预检请求直接返回 200
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}

// 服务监听地址
var listenAddress = ":8080"

func main() {
	server := &CalculatorServer{}
	mux := http.NewServeMux()
	path, handler := calculatorv1connect.NewCalculatorServiceHandler(server)
	mux.Handle(path, handler)
	// 增加 CORS 中间件
	corsHandler := corsMiddleware(mux)
	log.Printf("server is run on %s\n", listenAddress)
	err := http.ListenAndServe(
		listenAddress,
		h2c.NewHandler(corsHandler, &http2.Server{}),
	)
	if err != nil {
		log.Panic(err)
	}

}

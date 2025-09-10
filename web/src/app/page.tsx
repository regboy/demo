'use client';

import { FormEvent, useState } from 'react';

// 请求体类型
type CalculatorRequest = {
  ParamA: number;
  ParamB: number;
  Operator: string;
};

// 响应体类型
type CalculatorResponse = {
  Code: string;       // 状态码，例如 0 表示成功
  Result: string;     // 计算结果
  Msg: string;        // 消息提示
};

export default function Home() {
  // 保存计算结果
  const [result, setResult] = useState<string | null>(null);
  // 保存错误信息
  const [error, setError] = useState<string | null>(null);

  /**
   * 表单提交处理函数
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认表单提交行为

    const formData = new FormData(e.currentTarget);

    // 构建请求体
    const body: CalculatorRequest = {
      ParamA: Number(formData.get("paramA")),
      ParamB: Number(formData.get("paramB")),
      Operator: String(formData.get("operator"))
    };

    try {
      // 调用后端接口
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL+'/calculator.v1.CalculatorService/Calculator',
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(body)
        }
      );

      const data: CalculatorResponse = await res.json();
      //console.log('返回数据：', data);

      // 根据返回状态更新结果或错误
      if (data.Code === '1') {
        setResult(data.Result);
        setError(null);
      } else {
        setResult(null);
        setError(data.Msg);
      }
    } catch (err: any) {
      // 网络或其他异常
      setResult(null);
      setError(err.message || '请求出错');
    }
  };

  return (
    <div className="p-20">
      <h1 className="text-6xl">Calculator Demo</h1>

      <div className="bg-gray-100 p-10 rounded-sm mt-10">
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col space-y-6'>
            {/* 输入参数 A */}
            <input
              className='border w-60 border-gray-300 focus:outline-2 focus:outline-blue-500 py-2 rounded-sm px-4'
              name="paramA"
              placeholder='请输入参数 A'
              type="number"
              required
            />
            <select
              defaultValue=""
              name="operator"
              className='border px-2 py-2 text-xl border-gray-300'
              required
            >
              <option value="">请选择运算符</option>
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">*</option>
              <option value="/">/</option>
              <option value="%">%</option>
            </select>
            <input
              className='border w-60 border-gray-300 focus:outline-2 focus:outline-blue-500 py-2 rounded-sm px-4'
              name="paramB"
              placeholder='请输入参数 B'
              type="number"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 focus:outline-2 text-white rounded-full px-10 py-2 focus:outline-blue-500 active:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
        <div className='mt-10 text-xl'>
          {result !== null && <p>Result: {result}</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>
      </div>
    </div>
  );
}

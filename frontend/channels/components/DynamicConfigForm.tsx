/**
 * 动态配置表单组件
 * 根据 provider.config_schema 自动生成表单字段
 */
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import type { ConfigFieldSchema } from '../types/channel';

interface DynamicConfigFormProps {
  schema: Record<string, ConfigFieldSchema>;
  form?: any;
  prefix?: string[];
}

export function DynamicConfigForm({ schema, form, prefix = ['config'] }: DynamicConfigFormProps) {
  const renderField = (key: string, field: ConfigFieldSchema) => {
    const namePath = [...prefix, key];
    const rules = [];

    if (field.required) {
      rules.push({ required: true, message: `请输入${field.label}` });
    }

    if (field.validation?.pattern) {
      rules.push({ pattern: new RegExp(field.validation.pattern), message: '格式不正确' });
    }

    const formItemProps = {
      name: namePath,
      label: field.label,
      rules,
      help: field.helpText,
    };

    switch (field.type) {
      case 'string':
        return (
          <Form.Item key={key} {...formItemProps}>
            <Input placeholder={field.placeholder} />
          </Form.Item>
        );

      case 'secret':
        return (
          <Form.Item key={key} {...formItemProps}>
            <Input.Password placeholder={field.placeholder} />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item key={key} {...formItemProps}>
            <InputNumber
              style={{ width: '100%' }}
              min={field.validation?.min}
              max={field.validation?.max}
              placeholder={field.placeholder}
            />
          </Form.Item>
        );

      case 'enum':
        return (
          <Form.Item key={key} {...formItemProps}>
            <Select
              options={field.validation?.options}
              placeholder={field.placeholder}
            />
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item key={key} {...formItemProps} valuePropName="checked">
            <Switch />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Object.entries(schema).map(([key, field]) => renderField(key, field))}
    </>
  );
}

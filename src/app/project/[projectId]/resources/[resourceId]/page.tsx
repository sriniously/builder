"use client";

import {
  useGetResourceQuery,
  useUpdateResourceMutation,
} from "@/lib/api/resources";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FromOptions, TFrom, ToOptions, TTo } from "@/lib/data/options";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { useDebounceCallback } from "usehooks-ts";
import { Editor } from "@/components/editors/editor";
import { handleConvert, tsToZod, zodToTs } from "@/lib/data/conversion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Resource } from "@/lib/db/models";

export default function ResourcePage() {
  const { projectId, resourceId } = useParams();
  const [fromData, setFromData] = useState<string>("");
  const [numOfMocks, setNumOfMocks] = useState("1");
  const [toData, setToData] = useState<string>("");
  const [from, setFrom] = useState<TFrom>("ts");
  const [to, setTo] = useState<TTo>("json");
  const isDataLoaded = useRef(false);

  const { mutate: updateResource } = useUpdateResourceMutation(
    Number(projectId),
    Number(resourceId)
  );

  const { data: resource } = useGetResourceQuery(
    Number(projectId),
    Number(resourceId)
  );

  useEffect(() => {
    if (resource && !isDataLoaded.current) {
      // need to convert to ts then set
      if (resource.content) {
        const tsData = zodToTs(resource.content);
        setFromData(tsData);
      }
      isDataLoaded.current = true;
    }
  }, [resource]);

  const saveFromData = (value: string) => {
    // we will save the zod version of the data
    if (from === "zod") {
      updateResource({
        ...resource,
        content: value,
      } as Resource);
    } else if (from === "ts") {
      // convert then save
      const convertedData = tsToZod(value, true);
      updateResource({
        ...resource,
        content: convertedData,
      } as Resource);
    }
  };

  const debouncedSaveFromData = useDebounceCallback(saveFromData, 1000);

  const handleFromChange = (value: TFrom) => {
    setFrom(value);

    if (value) {
      handleConvert({
        from,
        to: value,
        fromData: `${fromData}`,
        numOfMocks,
        setToData: setFromData,
      });

      handleConvert({ from, to, fromData, numOfMocks, setToData });
    }
  };

  const handleToChange = (value: TTo) => {
    setTo(value);

    handleConvert({ from, to: value, fromData, numOfMocks, setToData });
  };

  const handleFromDataChange = (val: string) => {
    setFromData(val);
    debouncedSaveFromData(val);
    if (!val) {
      setToData("");
    }
  };

  const FromEditors = {
    ts: (
      <Editor onChange={handleFromDataChange} value={fromData} language="ts" />
    ),
    zod: (
      <Editor onChange={handleFromDataChange} value={fromData} language="ts" />
    ),
  };

  const ToEditors = {
    json: (
      <Editor onChange={() => {}} value={toData} language="json" readOnly />
    ),
    pg: <Editor onChange={() => {}} value={toData} language="sql" readOnly />,
    go: <Editor onChange={() => {}} value={toData} language="go" readOnly />,
  };

  if (!resource) {
    return null;
  }

  return (
    <div className="2xl:h-[96vh] h-[94vh] overflow-y-hidden">
      <h2 className="text-2xl font-bold">{resource.name}</h2>
      <p className="text-base text-gray-400 mt-2">{resource.description}</p>

      <section className="flex h-full">
        <div className="flex-[0.5] h-full mt-12">{FromEditors[from]}</div>

        {/* Middle separator */}
        <div className="relative">
          <div className="border-l border-[0.5px] w-0 border-gray-700 h-full" />

          <Button
            className="absolute top-0 right-52"
            onClick={() =>
              handleConvert({ from, to, fromData, numOfMocks, setToData })
            }
            disabled={!fromData}
          >
            Convert
          </Button>

          <Select onValueChange={handleFromChange} defaultValue={from}>
            <SelectTrigger className="w-[180px] absolute top-0 right-2">
              <SelectValue placeholder="Convert From" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>From</SelectLabel>
                {FromOptions.map(({ label, value, icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {icon}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select onValueChange={handleToChange} defaultValue={to}>
            <SelectTrigger className="w-[180px] absolute top-0 left-2">
              <SelectValue placeholder="Convert To" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>To</SelectLabel>
                {ToOptions.map(({ label, value, icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {icon}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {(to === "json" || to === "pg") && (
            <Input
              value={numOfMocks}
              className="absolute top-0 left-52 w-20"
              onChange={(e) => {
                setNumOfMocks(e.target.value);
                handleConvert({
                  from,
                  to,
                  fromData,
                  numOfMocks: e.target.value,
                  setToData,
                });
              }}
            />
          )}
        </div>

        <div className="flex-[0.5] h-full mt-12">{ToEditors[to]}</div>
      </section>
    </div>
  );
}
